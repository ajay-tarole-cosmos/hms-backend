const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Op } = require("sequelize");
const { Guests, RoomNumber, Reservation, Room, GuestDetail, BookingLog, Staff, sequelize } = require("../models");
const { RoomStatus, RoomBookingStatus } = require("../utils/RoomStatus");


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

  export {
    checkInandCheckOut,checkingRoomAvailabilty,createGuestData
  }