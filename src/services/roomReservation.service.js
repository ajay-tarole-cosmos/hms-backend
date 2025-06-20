const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Op } = require("sequelize");
const { Guests, RoomNumber, Reservation, Room, GuestDetail, BookingLog, Staff, sequelize, Payments, Folio, FolioCharge, Invoice } = require("../models");
const { generateUniqueBookingId } = require("../utils/UniqueBookingId");
const paginate = require("../models/plugins/paginate.plugin");
const { RoomStatus, RoomBookingStatus } = require("../utils/RoomStatus");
const { createGuest } = require("./user.service");
const moment = require('moment');
const papa = require('papaparse');
const ExcelJS = require('exceljs');
const { safelyAddChargeToFolio, safelyGenerateRoomCharges, safelyCreateFolio, generateInvoiceFromFolio, processPayment, updateFolioTotals, createFolio, } = require("./billing.service");
const { GuestService } = require(".");
const { sendReservationConfirmationEmail } = require("./email.service");
const RoomPricing = require("../models/roomPricing.model");

const GST_RATES = {
  STANDARD: 18.0, // Standard GST rate for hotel services
  REDUCED: 12.0, // Reduced rate for certain services
  EXEMPT: 0.0, // Exempt services
}

const createGuestData = async (roomIds, guests, extraBed = 0, files = [], transaction = null) => {
  const finalGuestList = [];

  let data = roomIds.map((item) => item.room_id)
  // Get room capacity
  const roomDetails = await RoomNumber.findAll({
    where: { id: { [Op.in]: data } },
    include: [
      {
        model: Room,
        as: "room",
        attributes: ["capacity"],
      },
    ],
    transaction,
  })

  console.log('roomdetailas', roomDetails)

  if (roomDetails?.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Room not found");
  }

  let roomCapacity = 0;
  let totalCapacity = 0;
  roomDetails?.forEach((item) => {
    roomCapacity += item.room?.capacity || 1;
  })
  totalCapacity += roomCapacity + extraBed;


  if (guests.length > totalCapacity) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Cannot add more than ${totalCapacity} guests`)
  }

  for (const [index, guestData] of guests.entries()) {

    if (!guestData.first_name?.trim()) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Guest ${index + 1}: First name is required`)
    }

    const orConditions = []
    if (guestData.email?.trim()) orConditions.push({ email: guestData.email.trim() })
    if (guestData.phone?.trim()) orConditions.push({ phone: guestData.phone.trim() })

    let guest = null
    const existingGuest =
      orConditions.length > 0 ? await Guests.findOne({ where: { [Op.or]: orConditions }, transaction }) : null

    const baseGuestData = {
      first_name: guestData.first_name.trim(),
      last_name: guestData.last_name?.trim() || "",
      email: guestData.email?.trim() || null,
      phone: guestData.phone?.trim() || null,
      gender: guestData.gender || null,
      father_name: guestData.father_name || null,
      occupation: guestData.occupation || null,
      nationality: guestData.nationality || null,
      date_of_birth: guestData.date_of_birth || null,
    }

    if (existingGuest) {
      await existingGuest.update(baseGuestData, { transaction })
      guest = existingGuest
    } else {
      guest = await Guests.create(baseGuestData, { transaction })
    }

    const guestDetails = guestData.guest_details
    if (guestDetails) {
      const matchingFile = files.find((file, fileIndex) => fileIndex === index)

      const existingDetail = await GuestDetail.findOne({
        where: { guest_id: guest.id },
        transaction,
      })

      const detailPayload = {
        document_type: guestDetails.document_type || "id",
        frontend_url: matchingFile?.path || guestDetails.frontend_url || null,
        backend_url: matchingFile?.path || guestDetails.backend_url || null,
        mime_type: matchingFile?.mimetype || guestDetails.mime_type || null,
        state: guestDetails.state || null,
        city: guestDetails.city || null,
        zip_code: guestDetails.zip_code || null,
        address: guestDetails.address || null,
        comment: guestDetails.comment || null,
        country: guestDetails.country || null,
      }

      Object.keys(detailPayload).forEach((key) => {
        if (detailPayload[key] === undefined) {
          delete detailPayload[key]
        }
      })

      if (existingDetail) {
        await existingDetail.update(detailPayload, { transaction })
      } else {
        await GuestDetail.create({ guest_id: guest.id, ...detailPayload }, { transaction })
      }
    }

    finalGuestList.push(guest.toJSON())
  }

  return finalGuestList
}

const checkInandCheckOut = async (check_in_date_time, check_out_date_time) => {
  const today = new Date().toISOString().split("T")[0];
  if (today > check_in_date_time) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Check-in date cannot be in the past.");
  }

  const checkIn = new Date(check_in_date_time);
  const checkOut = new Date(check_out_date_time);
  if (isNaN(checkIn) || isNaN(checkOut)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format.");
  }

  if (checkIn >= checkOut) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Check-out must be after check-in.");
  }

  return {
    check_in_date: checkIn.toISOString(),
    check_out_date: checkOut.toISOString(),
  };
};

const checkingRoomAvailabilty = async (roomId, checkIn, checkOut, excludeReservationId = null) => {
  const room = await RoomNumber.findByPk(roomId)

  if (!room) {
    throw new ApiError(httpStatus.NOT_FOUND, "Room not found")
  }

  console.log("room",room)
  const unavailableStatuses = [RoomStatus.MAINTENANCE, RoomStatus.OUT_OF_ORDER, RoomStatus.BLOCKED]
  if (unavailableStatuses.includes(room.room_status)) {
    return {
      available: false,
      reason: `Room is ${room.room_status}`,
    }
  }

  const whereClause = {
    rooms: {
      [Op.contains]: { room_id: roomId }
    },
    booking_status: [RoomBookingStatus.BOOKED, RoomBookingStatus.CHECK_IN],
    [Op.or]: [
      {
        check_in_date_time: { [Op.lt]: checkOut },
        check_out_date_time: { [Op.gt]: checkIn },
      },
    ],
  }

  if (excludeReservationId) {
    whereClause.id = { [Op.ne]: excludeReservationId }
  }

  const conflictingReservations = await Reservation.findAll({
    where: whereClause,
    attributes: ["id", "booking_id", "check_in_date_time", "check_out_date_time"],
  })

  if (conflictingReservations.length > 0) {
    return {
      available: false,
      reason: "Room has conflicting reservations",
      conflicts: conflictingReservations,
    }
  }

  return { available: true }
}

const calculateReservationPrices = async (bookingData) => {
  const checkIn = new Date(bookingData.check_in_date_time)
  const checkOut = new Date(bookingData.check_out_date_time)

  // Fetch applicable offers from DB
  const applicableOffers = await RoomPricing.findAll({
    where: {
      [Op.or]: [
        {
          valid_date_from: { [Op.lte]: checkIn },
          valid_date_to: { [Op.gte]: checkIn }
        },
        {
          valid_date_from: { [Op.lte]: checkOut },
          valid_date_to: { [Op.gte]: checkOut }
        },
        {
          valid_date_from: { [Op.lte]: checkIn },
          valid_date_to: { [Op.gte]: checkOut }
        }
      ]
    }
  })

  const isWeekend = (dateStr) => {
    const day = new Date(dateStr).getDay()
    return day === 0 || day === 6
  }

  // Extract room IDs
  const roomNumberIds = bookingData.rooms?.map(item => item.room_id)

  // Get room details for all rooms
  const roomNumbers = await RoomNumber.findAll({
    where: { id: { [Op.in]: roomNumberIds } },
    include: [
      {
        model: Room,
        as: "room",
      },
    ],
  })
  console.log("roomNumbers",roomNumbers)

  if (!roomNumbers.length) {
    throw new ApiError(httpStatus.NOT_FOUND, "No room numbers found")
  }

  // Calculate number of nights
  const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)))

  // Calculate guest quantity for services
  // const guestCount = Array.isArray(bookingData.guests) ? bookingData.guests.length : 1
  // const quantity = nights * guestCount

  // Initialize price variables
  let totalRoomCharges = 0
  let totalServiceCharges = 0
  let totalDiscounts = 0
  let totalTaxAmount = 0

  // Calculate room prices
  const roomsPrice = roomNumbers.map(roomNumber => {
    const roomRate = Number.parseFloat(roomNumber?.room?.price || 0)
    const baseAmount = roomRate * nights
    const totalAmount = baseAmount
    let discount = 0
    // Find best applicable offer for this room
    const room_type_id = roomNumber?.room_id
    const offersForRoom = applicableOffers.filter(offer => offer.room_type_id === room_type_id)
console.log("offersForRoom",offersForRoom)
    const getDiscountAmount = (offer, baseAmount) => {
        return (baseAmount * offer.discount_value) / 100
    }
    const bestOffer = offersForRoom
      .filter(offer => {
        if (offer.offer_type === 'seasonal') return true
        if (offer.offer_type === 'weekend') return isWeekend(checkIn) || isWeekend(checkOut)
        return false
      })
      .reduce((best, current) => {
        const currentDiscount = getDiscountAmount(current, baseAmount)
        const bestDiscount = best ? getDiscountAmount(best, baseAmount) : 0
        return currentDiscount > bestDiscount ? current : best
      }, null)

    // Apply discount if any
    let finalAmount=baseAmount;
    if (bestOffer) {
      discount = getDiscountAmount(bestOffer, baseAmount)
      finalAmount = baseAmount - discount
      console.log("bestOffer", baseAmount, bestOffer.offer_type, discount, finalAmount)
    }

    totalRoomCharges += finalAmount
    totalDiscounts += discount
    return {
      room: roomNumber,
      price_per_night: roomRate,
      total_room_price: baseAmount,
      total_amount: totalAmount,
      total_nights: nights,
      discount: discount,
    }
  })

  // Calculate service prices
  const servicesData = (bookingData.package_ids || []).map(service => {
    const serviceRate = Number.parseFloat(service?.package_price || 0)
    const baseAmount = serviceRate
    const totalAmount = baseAmount

    totalServiceCharges += baseAmount
    console.log("roomsPrice",roomsPrice)

    return {
      service,
      price_per_night: serviceRate,
      total_service_price: baseAmount,
      total_amount: totalAmount,
      quantity: 1,
      discount: 0,
    }
  })

  // Calculate extra bed charges if applicable
  let extraBedCharges = 0

  const extraBedCount = Number.parseInt(bookingData.extra_bed || 0)

  if (extraBedCount > 0) {
    const extraBedRate = Number.parseFloat(bookingData.extra_bed) // Already rate per bed per night
    const extraBedTotalAmount = extraBedRate * nights * extraBedCount
    extraBedCharges = extraBedTotalAmount
  }

  // Calculate grand total
  const subtotal = totalRoomCharges + totalServiceCharges 
  totalTaxAmount = parseFloat(parseFloat(((totalServiceCharges + totalRoomCharges) * GST_RATES.STANDARD) / 100).toFixed(2))
  const grandTotal = subtotal + totalTaxAmount // Currently totalTaxAmount is 0
console.log("totalTaxAmount",totalTaxAmount)

console.log(" totalRoomCharges + totalServiceCharges  - totalDiscounts", totalRoomCharges , totalServiceCharges  ,totalDiscounts)
console.log("grandTotal",grandTotal)

  return {
    roomsPrice,
    servicesData,
    // extraBed: {
    //   count: extraBedCount,
    //   baseAmount: extraBedCharges,
    //   taxAmount: 0,
    //   totalAmount: extraBedCharges
    // },
    totalRoomCharges,
    totalServiceCharges,
    totalExtraBedCharges: extraBedCharges,
    totalTaxAmount,
    totalDiscounts,
    subtotal,
    grandTotal
  }
}

const createRoomBooking = async (bookingData, req) => {
  const transaction = await sequelize.transaction()
  try {
    const dates = await checkInandCheckOut(bookingData.check_in_date_time, bookingData.check_out_date_time)
    const today = new Date()
    const checkInDate = new Date(dates.check_in_date)
    const isToday =
      checkInDate.getFullYear() === today.getFullYear() &&
      checkInDate.getMonth() === today.getMonth() &&
      checkInDate.getDate() === today.getDate()

    // Check room availability
    const roomAvailabilityResults = await Promise.all(
      bookingData.rooms?.map(room =>
        checkingRoomAvailabilty(room.room_id, dates.check_in_date, dates.check_out_date)
      )
    )

    // Check if all rooms are available
    const allAvailable = roomAvailabilityResults.every(result => result.available === true)
    console.log("allAvailable",roomAvailabilityResults)
    if (!allAvailable) throw new Error("Room is not available for selected dates.")

    // Process guest data
    const guestArray = Array.isArray(bookingData.guests) ? bookingData.guests : [bookingData.guests]
    const files = req.files?.guestDocuments || []
    const guests = await createGuestData(bookingData.rooms, guestArray, bookingData.extra_bed, files)

    if (!guests.length) throw new ApiError(httpStatus.BAD_REQUEST, "At least one guest is required.")

    // Calculate all prices
    const priceCalculation = await calculateReservationPrices(bookingData)

    // Generate booking ID
    const booking_id = await generateUniqueBookingId()

    // Create reservation
    const booking = await Reservation.create(
      {
        booking_id,
        guest_id: guests[0].id,
        additional_guests: guests.slice(1).map((g) => g.id),
        rooms: bookingData.rooms,
        total_rooms: bookingData.total_rooms,
        check_in_date_time: dates.check_in_date,
        check_out_date_time: dates.check_out_date,
        booking_type: bookingData.booking_type,
        purpose_of_visit: bookingData.purpose_of_visit,
        remarks: bookingData.remarks,
        total_amount: priceCalculation.grandTotal, // Use calculated grand total
        reason: bookingData.reason || "",
        booking_status: isToday ? RoomBookingStatus.CHECK_IN : RoomBookingStatus.BOOKED,
        services: bookingData?.package_ids || []
      }, {
      userId: req.user?.id || 'db1167fb-de69-4f0e-a257-0812311f4fab',
      remark: 'New reservation created'
    },
      { transaction }
    )

    let roomsData = bookingData?.rooms.map((item) => item.room_id)
    await RoomNumber.update(
      {
        is_available: false,
        room_status: isToday ? RoomStatus.OCCUPIED : RoomStatus.BOOKED,
      },
      {
        where: { id: roomsData },
        transaction,
      },
    )
        bookingData.guests[0].email && ( await sendReservationConfirmationEmail(bookingData.guests[0], {
          guest_name: bookingData.guests[0].full_name,
          booking_id: booking.booking_id,
          check_in_date: booking.check_in_date_time,
          check_out_date: booking.check_out_date_time,
          total_amount: booking.total_amount,
        })
    )

    try {
      const folio = await safelyCreateFolio(booking.id, guests[0].id, transaction)

      if (folio && folio.id) {
        // Generate room charges using the calculated prices
        for (const roomPrice of priceCalculation.roomsPrice) {
          await safelyAddChargeToFolio(
            folio.id,
            {
              charge_type: "room_charge",
              description: `Room ${roomPrice.room.room_number || "Unknown"} - ${roomPrice.total_nights} night(s)`,
              unit_price: roomPrice.price_per_night,
              quantity: roomPrice.total_nights,
              is_taxable: true,
              tax_rate: GST_RATES.STANDARD,
              discount: roomPrice.discount || 0,
              payment_status: bookingData?.payment_status ? 1 : 0,
              room_id: roomPrice.room.id,
              item_type: 'Room',
              item_description: roomPrice.room.room_type,
              details: roomPrice.room.room_number,
            },
            req.user?.id || "db1167fb-de69-4f0e-a257-0812311f4fab",
            transaction,
          )
        }

        // Add service charges if provided
        for (const service of priceCalculation.servicesData) {
          await safelyAddChargeToFolio(
            folio.id,
            {
              charge_type: "service_charge",
              description: service.service.package_name || "Service",
              unit_price: service.price_per_night,
              quantity: service.quantity,
              is_taxable: true,
              tax_rate: GST_RATES.STANDARD,
              discount: 0,
              payment_status: bookingData?.payment_status ? 1 : 0,
              room_id: service.service.package_id,
              item_type: 'Service',
              item_description: service.service.package_name,
              details: '',
            },
           req.user?.id || "db1167fb-de69-4f0e-a257-0812311f4fab",
            transaction,
          )
        }

        // Add extra bed charges if applicable
        if (priceCalculation?.extraBed?.count > 0) {
          const nights = priceCalculation.roomsPrice[0]?.total_nights || 1

          await safelyAddChargeToFolio(
            folio.id,
            {
              charge_type: "extra_bed",
              description: `Extra bed(s) - ${priceCalculation.extraBed.count} bed(s) for ${nights} night(s)`,
              unit_price: 500, // Default rate per bed
              quantity: priceCalculation.extraBed.count * nights,
              is_taxable: true,
              tax_rate: GST_RATES.STANDARD,
            },
           req.user?.id || "db1167fb-de69-4f0e-a257-0812311f4fab",
            transaction,
          )
        }
      }
    } catch (billingError) {
      console.error("Error in billing operations:", billingError)
    }

    await transaction.commit()
    return booking
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

const updateReservation = async (reservationId, bookingData, req) => {
  const transaction = await sequelize.transaction()
  console.log("priti")
  try {
    const existingReservation = await Reservation.findByPk(reservationId, { transaction })
    if (!existingReservation) {
      throw new ApiError(httpStatus.NOT_FOUND, "Reservation not found")
    }

    console.log(bookingData.check_in_date_time && bookingData.check_out_date_time, "bookingData")
    if (bookingData.check_in_date_time && bookingData.check_out_date_time) {
      const dates = await checkInandCheckOut(bookingData.check_in_date_time, bookingData.check_out_date_time)
      bookingData.check_in_date_time = dates.check_in_date
      bookingData.check_out_date_time = dates.check_out_date
    }
    console.log(" bookingData.check_in_date_time", bookingData.check_in_date_time)
    console.group("  bookingData.check_out_date_time ", bookingData.check_out_date_time)
    // if (bookingData.rooms || bookingData.check_in_date_time || bookingData.check_out_date_time) {
    //   const roomId = bookingData.room_id || existingReservation.room_number_id
    //   const checkIn = bookingData.check_in_date_time || existingReservation.check_in_date_time
    //   const checkOut = bookingData.check_out_date_time || existingReservation.check_out_date_time

    //   // Check room availability
    //   const roomAvailabilityResults = await Promise.all(
    //     bookingData?.rooms?.map(room =>
    //       checkingRoomAvailabilty(room.room_id, checkIn, checkOut)
    //     )
    //   )

    //   // Check if all rooms are available
    //   const allAvailable = roomAvailabilityResults.every(result => result.available === true)
    //   if (!allAvailable) throw new Error("Room is not available for selected dates.")

    //   // const isAvailable = await checkingRoomAvailabilty(roomId, checkIn, checkOut, reservationId)
    //   // if (!isAvailable.available) {
    //   //   throw new ApiError(httpStatus.CONFLICT, isAvailable.reason)
    //   // }
    // }

    if (bookingData.guests && Array.isArray(bookingData.guests)) {
      const guestArray = bookingData.guests
      const files = req.files || []
      const guests = await createGuestData(
        bookingData.rooms || existingReservation.rooms,
        guestArray,
        bookingData.extra_bed || 0,
        files,
        transaction,
      )

      if (!guests.length) {
        throw new ApiError(httpStatus.BAD_REQUEST, "At least one guest is required.")
      }

      bookingData.guest_id = guests[0].id
      bookingData.additional_guests = guests.slice(1).map((g) => g.id)
    }

    const { guests, ...reservationData } = bookingData

    const updatedReservation = await existingReservation.update(reservationData, { transaction })
    // if (bookingData.room_id && bookingData.room_id !== existingReservation.room_number_id) {
    //   await RoomNumber.update(
    //     {
    //       is_available: true,
    //       room_status: RoomStatus.AVAILABLE,
    //     },
    //     {
    //       where: { id: existingReservation.room_number_id },
    //       transaction,
    //     },
    //   )

    //   const today = new Date()
    //   const checkInDate = new Date(updatedReservation.check_in_date_time)
    //   const isToday =
    //     checkInDate.getFullYear() === today.getFullYear() &&
    //     checkInDate.getMonth() === today.getMonth() &&
    //     checkInDate.getDate() === today.getDate()

    //   await RoomNumber.update(
    //     {
    //       is_available: false,
    //       room_status: isToday ? RoomStatus.OCCUPIED : RoomStatus.BOOKED,
    //     },
    //     {
    //       where: { id: bookingData.room_id },
    //       transaction,
    //     },
    //   )
    // }

    await transaction.commit()
    return updatedReservation
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

const guestReservationDetails = async (req) => {
  const { reservation_id } = req.params

  if (!reservation_id) {
    throw new ApiError(httpStatus.NOT_FOUND, "Please provide a valid identity")
  }

  const exist_reserve = await Reservation.findByPk(reservation_id)
  if (!exist_reserve) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Provided booking details do not exist in data")
  }

  // Suppose exist_reserve.room_number_ids is an array like:
  const roomIds = exist_reserve?.rooms?.map(item => item.room_id) || []; // e.g. ['id1', 'id2', 'id3']

  const room_numbers = await RoomNumber.findAll({
    where: {
      id: {
        [Op.in]: roomIds
      }
    }
  });
  const roomTypesIds = room_numbers?.map(roomNum => roomNum.room_id);
  const room_types = await Room.findAll({
    where: {
      id: {
        [Op.in]: roomTypesIds
      }
    }
  });
  const roomTypeMap = {};
  room_types.forEach(rt => {
    roomTypeMap[rt.id] = rt;
  });

  const enrichedRooms = room_numbers.map(room_number => {
    const room_type = roomTypeMap[room_number.room_id];

    return {
      ...(room_number
        ? {
          room_id: room_number.id,
          room_number: room_number.room_number,
          floor_number: room_number.floor_number,
        }
        : {}),
      ...(room_type
        ? {
          room_type: room_type.id,
          room_type_name: room_type.room_type,
          capacity: room_type.capacity,
          extra_bed: room_type.extra_bed,
          price: room_type.price,
          amenities: room_type.amenities,
          bed_type: room_type.bed_type,
          image_url: room_type.image_url,
        }
        : {
          extra_bed: 0,
        }),
    };
  });
  // const room_number = await RoomNumber.findByPk(exist_reserve.room_number_id)
  // const room_type = room_number ? await Room.findByPk(room_number.room_id) : null

  const main_guest = await Guests.findByPk(exist_reserve.guest_id, {
    include: [{ model: GuestDetail, as: "guest_details" }],
  })

  const additionalGuestIds = exist_reserve.additional_guests || []
  const additionalGuests = await Guests.findAll({
    where: { id: additionalGuestIds },
    include: [{ model: GuestDetail, as: "guest_details" }],
  })

  const allGuests = [main_guest, ...additionalGuests].filter(Boolean)

  const guests = allGuests.map((g) => {
    const guestJson = g.toJSON()
    return {
      first_name: guestJson.first_name,
      last_name: guestJson.last_name,
      email: guestJson.email,
      phone: guestJson.phone,
      gender: guestJson.gender,
      father_name: guestJson.father_name,
      occupation: guestJson.occupation,
      nationality: guestJson.nationality,
      date_of_birth: guestJson.date_of_birth,
      guest_details: guestJson.guest_details || {},
    }
  })

  return {
    check_in_date_time: exist_reserve.check_in_date_time,
    check_out_date_time: exist_reserve.check_out_date_time,
    booking_type: exist_reserve.booking_type,
    total_amount: exist_reserve.total_amount,
    rooms: enrichedRooms,
    booking_status: exist_reserve.booking_status,
    purpose_of_visit: exist_reserve.purpose_of_visit,
    remarks: exist_reserve.remarks,
    services: exist_reserve.services,
    guests,
  }
}

const getallGuestReservation = async (req) => {
  const filters = {}
  const { page, limit, sortBy = [["created_at", "desc"]] } = req.query;
  const reservation = paginate(Reservation, filters, { page, limit, sortBy })
  return reservation;
}

const avaibilityToChangeRoom = async (req) => {
  const { change_reason, note, room_ids } = req.body;
  const { reservation_id } = req.params;

  // const roomIdList = Object.keys(room_ids || {});
  const roomIdList = Object.values(room_ids)
    .map(r => r.selectedRoomNumber)
    .filter(Boolean);

  if (roomIdList.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "room_ids must contain at least one room_id");
  }

  try {
    // Step 1: Fetch reservation
    const reservation = await Reservation.findByPk(reservation_id, {
    });

    if (!reservation) {
      throw new ApiError(httpStatus.NOT_FOUND, "Reservation not found");
    }

    // Step 2: Fetch and validate room availability
    const assignedRooms = await RoomNumber.findAll({
      where: { id: roomIdList },
    });


    if (assignedRooms.length !== roomIdList.length) {
      throw new ApiError(httpStatus.NOT_FOUND, "One or more rooms not found");
    }

    // Step 3: Check for overlapping reservations
    const overlappingReservations = await Reservation.findAll({
      where: {
        id: { [Op.ne]: reservation.id },
        check_in_date_time: { [Op.lt]: reservation.check_out_date_time },
        check_out_date_time: { [Op.gt]: reservation.check_in_date_time },
      },
    });

    const overlappingRooms = overlappingReservations.filter(r =>
      r.rooms?.some(room => roomIdList.includes(room.room_id))
    );

    if (overlappingRooms.length > 0) {
      const conflictRoomIds = overlappingRooms.flatMap(r =>
        r.rooms.filter(room => roomIdList.includes(room.room_id)).map(room => room.room_id)
      );

      throw new ApiError(
        httpStatus.CONFLICT,
        `Rooms already booked: ${[...new Set(conflictRoomIds)].join(", ")}`
      );
    }

    const newRoomMap = room_ids; // This is an object keyed by room_id
    const existingRooms = reservation.rooms || [];

    const updatedRooms = existingRooms.map(existing => {
      const updatedData = newRoomMap[existing.room_id];

      if (
        updatedData &&
        updatedData.selectedRoomNumber &&
        updatedData.room_type_id &&
        updatedData.selectedRoomNumber !== existing.room_id
      ) {
        // Room matches and has been changed
        return {
          room_id: updatedData.selectedRoomNumber,
          room_type: updatedData.room_type_id,
        };
      }

      // Keep existing room as is
      return existing;
    });
    console.log('4444444', updatedRooms, room_ids)


    // Check if anything actually changed
    const isChanged = JSON.stringify(existingRooms) !== JSON.stringify(updatedRooms);

    if (isChanged) {
      await Reservation.update(
        {
          rooms: updatedRooms,
          reason: change_reason,
          // note,
        },
        {
          where: { id: reservation_id },
        },
        {
          userId:req.user?.id || 'db1167fb-de69-4f0e-a257-0812311f4fab',
          remark: 'Reassignment',
        }
      );
    }
    // // Step 5: Update reservation with new rooms
    // await Reservation.update(
    //   {
    //     rooms: Object.values(room_ids)
    //       .filter(room => room.selectedRoomNumber && room.room_type_id)
    //       .map(room => ({
    //         room_id: room.selectedRoomNumber,
    //         room_type_id: room.room_type_id,
    //       })),
    //     reason: change_reason,
    //     // note,
    //   }, {
    //   where: { id: reservation_id }
    // }, {
    //   userId: 'db1167fb-de69-4f0e-a257-0812311f4fab',
    //   remark: 'Reassignment '
    // },
    // );

    return { massage: "" }
  } catch (error) {
    console.error("Room reassignment error:", error);
    throw error;
  }
};

const quickBookingReservatation = async (req) => {
  const {
    check_in_date_time,
    check_out_date_time,
    room_number_id,
    booking_type,
    total_amount,
    booking_status,
    services = [],
    guests = []
  } = req.body

  const { checkIn, checkOut } = await checkInandCheckOut(check_in_date_time, check_out_date_time)

  await checkBookingForGuest(room_number_id, checkIn, checkOut);
  const booking_id = await generateUniqueBookingId();

  const guestStatus = await createGuest(guests[0])

  const newReservation = await Reservation.create({
    guest_id: guestStatus.id,
    room_number_id,
    check_in_date_time,
    check_out_date_time,
    booking_type,
    booking_status,
    total_amount,
    booking_id: booking_id,
    services,
  });
  if (newReservation) {
    // await BookingLog.create({
    //     reservation_id: reservation.id,
    //     action: 'CREATE',
    //     performed_by: 'db1167fb-de69-4f0e-a257-0812311f4fab', //req.user.id,  // here staff id will be replace this UUID
    //     remarks: `Quick sReservation created for room `
    // });
  }
  return newReservation
}

const exportReservations = async (format, res) => {
  const reservations = await Reservation.findAll({
    include: [
      {
        model: Guests,
        as: 'guest',
        attributes: ['first_name', 'last_name', 'email'],
        required: false
      }
    ]
  });

  if (!reservations.length) {
    return res.status(404).json({ message: 'No reservations found' });
  }

  const transformedData = [];

  for (const [index, reservation] of reservations.entries()) {
    const plain = reservation.get({ plain: true });

    // Fetch all room numbers manually using room IDs
    let roomNumbers = [];

    if (Array.isArray(plain.rooms) && plain.rooms.length > 0) {
      const roomIds = plain.rooms.map(r => r.room_id); // extract IDs only
      roomNumbers = await RoomNumber.findAll({
        where: {
          id: roomIds
        },
        attributes: ['room_type', 'room_number']
      });
    }

    transformedData.push({
      serial: index + 1,
      guest_name: `${plain.guest?.first_name || 'N/A'} ${plain.guest?.last_name || ''}`.trim(),
      room_name: roomNumbers.map(r => r.room_number).join(', ') || 'N/A',
      room_type: [...new Set(roomNumbers.map(r => r.room_type))].join(', ') || 'N/A',
      check_in_date_time: plain.check_in_date_time,
      check_out_date_time: plain.check_out_date_time,
      purpose_of_visit: plain.purpose_of_visit,
      remarks: plain.remarks,
      booking_id: plain.booking_id,
      booking_type: plain.booking_type
    });
  }

  // Export logic
  if (format === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reservations');

    const columns = Object.keys(transformedData[0]).map((key) => ({ header: key, key }));
    worksheet.columns = columns;
    worksheet.addRows(transformedData);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="reservations.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } else {
    const csv = papa.unparse(transformedData);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="reservations.csv"');
    res.status(200).send(csv);
  }
};

const getLogsForReservation = async (req) => {
  const {
    sortBy = 'timestamp',
    sortOrder = 'desc',
    limit,
    page,
  } = req.query;

  const { reservation_id } = req.params;

  const options = {
    page,
    limit,
    sortBy: [[sortBy, sortOrder]],
    include: [
      {
        model: Staff,
        as: 'staff',
      },
    ],
  };

  const filters = { reservation_id };

  const logs = await paginate(BookingLog, filters, options);

  return logs;
};

const updateBookingReservation = async (req) => {
  const {
    check_in_date_time,
    check_out_date_time,
    purpose_of_visit,
    remarks,
    reason,
    booking_type,
    total_amount,
    booking_status,
    package_ids = [],
    guests = []
  } = req.body
  const { reservation_id } = req.params
  const exist_reservate = await Reservation.findByPk(reservation_id)
  if (!exist_reservate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Provide the valide booking identity');
  }

  const { check_in_date, check_out_date } = await checkInandCheckOut(check_in_date_time, check_out_date_time)
  const update_reservet = await exist_reservate.update({
    check_in_date_time: check_in_date ?? exist_reservate.check_in_date_time,
    check_out_date_time: check_out_date ?? exist_reservate.check_out_date_time,
    purpose_of_visit: purpose_of_visit ?? exist_reservate.purpose_of_visit,
    remarks: remarks ?? exist_reservate.remarks,
    reason: reason ?? exist_reservate.reason,
    booking_type: booking_type ?? exist_reservate.booking_type,
    total_amount: total_amount ?? exist_reservate.total_amount,
    booking_status: booking_status ?? exist_reservate.booking_status,
    services: package_ids ?? exist_reservate.services,
  })

  const guest_id = [];
  if (exist_reservate.guest_id) {

    guest_id.push(exist_reservate.guest_id);
  }

  if (Array.isArray(exist_reservate.additional_guests)) {
    guest_id.push(...exist_reservate.additional_guests);
  }

  const guestIdSet = new Set(guest_id.map(id => id?.toString().trim()));
  const matchedGuests = guests.filter(g => guestIdSet.has(g.id?.toString().trim()));

  await GuestService.updateMultipleGuests(matchedGuests);

  return update_reservet
}

const getRoomAvailability = async (req) => {
  const { date, startDate, endDate } = req.query;
  let targetDate;
  let filterByDate = false;

  if (date || (startDate && endDate)) {
    filterByDate = true;

    if (date) {
      if (date === 'today') {
        targetDate = moment().startOf('day');
      } else if (date === 'tomorrow') {
        targetDate = moment().add(1, 'day').startOf('day');
      } else {
        targetDate = moment(date).startOf('day');
        if (!targetDate.isValid()) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid date format. Use YYYY-MM-DD or "today"/"tomorrow"');
        }
      }
    } else {
      targetDate = moment(startDate).startOf('day');
      const endDateObj = moment(endDate).endOf('day');
      if (!targetDate.isValid() || !endDateObj.isValid()) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid date range format. Use YYYY-MM-DD');
      }

      if (targetDate.isAfter(endDateObj)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Start date must be before end date');
      }
    }
  }
  const roomTypes = await Room.findAll({
    include: [{
      model: RoomNumber,
      as: 'room',
      attributes: ['id', 'room_number', 'room_status', 'is_available', 'floor_number']
    }],
    attributes: ['id', 'room_type', 'description', 'price', 'capacity', 'amenities', 'bed_type', 'image_url']
  });

  let reservations = [];

  if (filterByDate) {
    const queryDateRange = date
      ? {
        start: targetDate.format('YYYY-MM-DD'),
        end: targetDate.format('YYYY-MM-DD')
      }
      : {
        start: targetDate.format('YYYY-MM-DD'),
        end: moment(endDate).format('YYYY-MM-DD')
      };

    reservations = await Reservation.findAll({
      where: {
        [Op.or]: [
          {
            check_in_date_time: {
              [Op.lte]: moment(queryDateRange.end).endOf('day').toDate()
            },
            check_out_date_time: {
              [Op.gte]: moment(queryDateRange.start).startOf('day').toDate()
            }
          }
        ],
        booking_status: ['booked', 'check_in']
      },
      include: [{
        model: Guests,
        as: 'guest',
        attributes: ['first_name', 'last_name', 'email', 'phone']
      }],
      attributes: ['id', 'room_number_id', 'check_in_date_time', 'check_out_date_time', 'booking_status', 'guest_id', 'additional_guests', ' total_amount']
    });
  } else {
    reservations = await Reservation.findAll({
      where: {
        booking_status: ['booked', 'check_in']
      },
      include: [{
        model: Guests,
        as: 'guest',
        attributes: ['first_name', 'last_name', 'email', 'phone']
      }],
      attributes: ['id', 'room_number_id', 'check_in_date_time', 'check_out_date_time', 'booking_status', 'guest_id', 'additional_guests', 'total_amount']
    });
  }
  const availabilityData = roomTypes.map(roomType => {
    const rooms = roomType.room.map(room => {
      let availabilityStatus;
      let roomReservations = [];

      roomReservations = reservations.filter(res =>
        res.room_number_id === room.id
      );

      if (filterByDate) {
        if (['maintenance', 'out of order'].includes(room.room_status)) {
          availabilityStatus = 'unavailable';
        } else if (roomReservations.length > 0) {
          const currentReservation = roomReservations.find(res =>
            moment(res.check_in_date_time).isSameOrBefore(targetDate) &&
            moment(res.check_out_date_time).isSameOrAfter(targetDate)
          );

          if (currentReservation) {
            availabilityStatus = currentReservation.booking_status === 'check_in' ?
              'occupied' : 'booked';
          } else {
            availabilityStatus = room.is_available ? 'available' : 'unavailable';
          }
        } else {
          availabilityStatus = room.is_available ? 'available' : 'unavailable';
        }
      } else {
        if (['maintenance', 'out of order'].includes(room.room_status)) {
          availabilityStatus = 'unavailable';
        } else if (roomReservations.some(res => res.booking_status === 'check_in')) {
          availabilityStatus = 'occupied';
        } else if (roomReservations.some(res => res.booking_status === 'booked')) {
          availabilityStatus = 'booked';
        } else {
          availabilityStatus = room.is_available ? 'available' : 'unavailable';
        }
      }

      return {
        room_id: room.id,
        room_number: room.room_number,
        floor: room.floor_number,
        current_status: room.room_status,
        availability: availabilityStatus,
        reservations: roomReservations.map(res => ({
          reservation_id: res.id,
          check_in: res.check_in_date_time,
          check_out: res.check_out_date_time,
          status: res.booking_status,
          total_amount: res.total_amount,
          guest: res.guest ? {
            first_name: res.guest.first_name,
            last_name: res.guest.last_name,
            email: res.guest.email,
            phone: res.guest.phone,
          } : null
        }))
      };
    });

    return {
      room_type_id: roomType.id,
      room_type: roomType.room_type,
      description: roomType.description,
      price: roomType.price,
      capacity: roomType.capacity,
      amenities: roomType.amenities,
      bed_type: roomType.bed_type,
      image_url: roomType.image_url,
      rooms,
      available_count: rooms.filter(r => r.availability === 'available').length,
      total_count: rooms.length
    };
  });


  const response = {
    room_types: availabilityData,
    filter_applied: filterByDate
  };

  if (filterByDate) {
    if (date) {
      response.date = targetDate.format('YYYY-MM-DD');
    } else {
      response.date_range = {
        start: targetDate.format('YYYY-MM-DD'),
        end: moment(endDate).format('YYYY-MM-DD')
      };
    }
  } else {
    response.message = 'Showing all rooms with current status';
  }

  return response;
};

const fetchReservationsInRange = async (req) => {
  let { start, end, booking_status } = req.query;

  if (!start || !end) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1).toISOString();
    const lastDay = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    start = start || firstDay;
    end = end || lastDay;
  }

  const whereClause = {
    check_in_date_time: {
      [Op.lte]: end,
    },
    check_out_date_time: {
      [Op.gte]: start,
    },
  };

  if (booking_status) {
    whereClause.booking_status = booking_status;
  }

  return await Reservation.findAll({
    where: whereClause,
    include: [{
      model: Guests,
      as: 'guest',
      attributes: ['first_name', 'last_name']
    }],
    order: [['check_in_date_time', 'ASC']],
  });
};


const getAllReservationData = async (req) => {
  const { limit, page, sortBy, booking_status } = req.query;

  const filter = {};
  if (booking_status) {
    filter.booking_status = booking_status;
  }

  const include = [
    {
      model: Guests,
      as: 'guest',
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
    },
    // {
    //   model: RoomNumber,
    //   as: 'room_number',
    //   attributes: ['id', 'room_number', 'floor_number', 'room_type', 'room_status'],
    //   include: [
    //     {
    //       model: Room,
    //       as: 'room',
    //       attributes: ['id', 'room_type', 'description', 'amenities', 'capacity', 'price', 'image_url']
    //     }
    //   ]
    // }
  ];

  const options = {
    include,
    limit,
    page,
    sortBy: sortBy ? JSON.parse(sortBy) : [['created_at', 'DESC']]
  };

  const { data, pagination } = await paginate(Reservation, filter, options);
  const reservationData = data.map(room => room.get({ plain: true }));

  const enrichedReservations = await Promise.all(
    reservationData.map(async (reservation) => {
      const roomIds = reservation.rooms.map(r => r.room_id);

      // Fetch RoomNumber with nested Room info
      const roomDetails = await RoomNumber.findAll({
        where: { id: roomIds },
        include: [
          {
            model: Room,
            as: 'room',
            attributes: [
              'id',
              'description',
              'room_type',
              'amenities',
              'capacity',
              'price',
              'image_url'
            ]
          }
        ],
        attributes: [
          'id',
          'room_number',
          'floor_number',
          'room_status'
        ],
        raw: false
      });

      // Merge each room in reservation.rooms with the full room info
      reservation.rooms = reservation.rooms.map(r => {
        const roomInfo = roomDetails.find(rd => rd.id === r.room_id);
        if (!roomInfo) return r;

        return {
          ...r,
          ...roomInfo.toJSON(), // spreads RoomNumber fields
          room: roomInfo.room ? roomInfo.room.toJSON() : null // nested Room
        };
      });

      return reservation;
    })
  );


  return { reservation: enrichedReservations, pagination };
};

const createPaymentService = async (body, userId = null, transaction = null) => {
  const { reservation_id, payment_method='cash', amount, transaction_id, reference_number, notes } = body;
  if (!reservation_id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "reservation_id is required");
  }

  const shouldCommit = !transaction;
  if (shouldCommit) {
    transaction = await sequelize.transaction();
  }

  try {
    // 1. Get reservation
    const reservation = await Reservation.findOne({
      where: { id: reservation_id },
      transaction,
    });

    if (!reservation) {
      throw new ApiError(httpStatus.NOT_FOUND, "Reservation not found");
    }

    // 2. Find folio for the reservation
    const folio = await Folio.findOne({
      where: { reservation_id },
      transaction,
    });

    if (!folio) {
      throw new ApiError(httpStatus.NOT_FOUND, "Folio not found for reservation");
    }

    // 3. Generate invoice from folio
    const invoice = await generateInvoiceFromFolio(folio.id, userId, transaction);

    // 4. Process payment (using invoice)
    const payment = await processPayment(
      {
        invoice_id: invoice.id,
        reservation_id,
        guest_id: reservation.guest_id,
        payment_method,
        amount: amount || invoice.total_amount,
        transaction_id,
        reference_number,
        notes,
      },
      userId,
      transaction
    );

    if (shouldCommit) {
      await transaction.commit();
    }
    return { invoice, payment };
  } catch (error) {
    if (shouldCommit) {
      await transaction.rollback();
    }
    throw error;
  }
};

const processCheckout = async (reservationId, checkoutData, userId='db1167fb-de69-4f0e-a257-0812311f4fab') => {
  console.log("reservationId",reservationId)
  const transaction = await sequelize.transaction();
  try {
    // 1. Retrieve the reservation with all necessary associations
    const reservation = await Reservation.findOne({
      where: { id: reservationId },
      include: [
        { 
          model: Guests, 
          as: 'guest',
          include: [{ model: GuestDetail, as: 'guest_details' }]
        },
        { 
          model: Folio, 
          as: 'folios',
          include: [
            { model: FolioCharge, as: 'charges' }
          ]
        }
      ],
      transaction
    });

    if (!reservation) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Reservation not found');
    }

    // 2. Validate reservation can be checked out
    if (reservation.booking_status === 'check_out') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Reservation already checked out');
    }

    if (reservation.booking_status === 'cancelled') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cancelled reservation cannot be checked out');
    }

    // 3. Get the active folio or create one if it doesn't exist
    let activeFolio = reservation.folios.find(f => f.status === 'active');
    if (!activeFolio) {
      activeFolio = await createFolio(reservationId, reservation.guest_id, transaction);
    }

    // 4. Calculate outstanding balance
    const folioTotals = await updateFolioTotals(activeFolio.id, transaction);
    const balance = folioTotals.balance;

    // 5. Process payment if amount > 0
    let paymentResult = null;
    if (checkoutData.paymentAmount > 0) {
      paymentResult = await createPaymentService({
        reservation_id: reservationId,
        payment_method: checkoutData.paymentMethod,
        amount: checkoutData.paymentAmount,
        transaction_id: checkoutData.transactionId,
        reference_number: checkoutData.referenceNumber,
        notes: checkoutData.paymentNotes,
        status: 'completed'
      }, userId, transaction);
    }

    // 6. Create final invoice if not already created by payment service
    let invoice = paymentResult?.invoice;
    if (!invoice) {
      invoice = await generateInvoiceFromFolio(activeFolio.id, userId, transaction);
    }

    // 7. Update reservation status
    await reservation.update({
      booking_status: 'check_out',
      checked_out_at: new Date()
    }, { transaction });

    // 8. Update room statuses
    const roomIds = reservation.rooms.map(room => room.room_id);
    await RoomNumber.update(
      { 
        is_available: true,
        room_status: 'vacant',
        last_maintenance_date: new Date()
      },
      { 
        where: { id: roomIds },
        transaction 
      }
    );

    // 9. Close the folio
    await Folio.update({
      status: 'closed',
      closed_date: new Date(),
      balance: balance - (checkoutData.paymentAmount || 0)
    }, { 
      where: { id: activeFolio.id },
      transaction 
    });

    // 10. Create booking log
    await BookingLog.create({
      reservation_id: reservation.id,
      guest_id: reservation.guest_id,
      action: 'check_out',
      performed_by: userId,
      remarks: 'Guest checked out'
    }, { transaction });

    await transaction.commit();

    return {
      reservation: await Reservation.findByPk(reservationId, {
        include: [
          { model: Guests, as: 'guest' },
          { model: Folio, as: 'folios' },
          { model: Invoice, as: 'invoices' }
        ]
      }),
      invoice: invoice,
      payment: paymentResult?.payment,
      balance: balance - (checkoutData.paymentAmount || 0)
    };

  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    console.error('Checkout error:', error);
    throw error;
  
  }
};

module.exports = {
  getallGuestReservation, guestReservationDetails, avaibilityToChangeRoom,
  quickBookingReservatation, updateBookingReservation, createRoomBooking, getRoomAvailability, updateReservation,
  exportReservations, getLogsForReservation, quickBookingReservatation, getAllReservationData, fetchReservationsInRange, 
  calculateReservationPrices,createPaymentService,processCheckout
}