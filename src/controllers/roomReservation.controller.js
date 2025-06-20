const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const sendResponse = require("../utils/sendResponse");
const { roomReservation } = require("../services");


const createReservation = catchAsync(async (req, res) => {
  try {
    const guestsData = [];
    const guestKeys = Object.keys(req.body).filter((key) => key.startsWith("guests["));

    if (guestKeys.length > 0) {
      const guestIndices = [
        ...new Set(
          guestKeys.map((key) => {
            const match = key.match(/guests\[(\d+)\]/);
            return match ? parseInt(match[1]) : null;
          })
        ),
      ]
        .filter((index) => index !== null)
        .sort((a, b) => a - b);

      guestIndices.forEach((index) => {
        const guest = {
          first_name: req.body[`guests[${index}][first_name]`] || "",
          last_name: req.body[`guests[${index}][last_name]`] || "",
          email: req.body[`guests[${index}][email]`] || "",
          phone: req.body[`guests[${index}][phone]`] || "",
          father_name: req.body[`guests[${index}][father_name]`] || "",
          gender: req.body[`guests[${index}][gender]`] || "",
          occupation: req.body[`guests[${index}][occupation]`] || "",
          date_of_birth: req.body[`guests[${index}][date_of_birth]`] || "",
          nationality: req.body[`guests[${index}][nationality]`] || "",
          guest_details: {
            country: req.body[`guests[${index}][guest_details][country]`] || "",
            state: req.body[`guests[${index}][guest_details][state]`] || "",
            city: req.body[`guests[${index}][guest_details][city]`] || "",
            zip_code: req.body[`guests[${index}][guest_details][zip_code]`] || "",
            address: req.body[`guests[${index}][guest_details][address]`] || "",
            comment: req.body[`guests[${index}][guest_details][comment]`] || "",
            document_type: req.body[`guests[${index}][guest_details][document_type]`] || "",
            frontend_url: req.body[`guests[${index}][guest_details][frontend_url]`] || "",
          },
        };
        if (guest.first_name.trim()) {
          guestsData.push(guest);
        }
      });
    }

    if (guestsData.length === 0) {
      if (req.body.guests) {
        try {
          let parsedGuests;
          if (typeof req.body.guests === 'string') {
            parsedGuests = JSON.parse(req.body.guests);
          } else {
            parsedGuests = req.body.guests;
          }
          
          if (Array.isArray(parsedGuests) && parsedGuests.length > 0) {
            parsedGuests.forEach(guest => {
              if (guest.first_name && guest.first_name.trim()) {
                guestsData.push(guest);
              }
            });
          }
        } catch (parseError) {
          console.log("Failed to parse guests JSON:", parseError);
        }
      }

      if (guestsData.length === 0) {
        const directGuest = {
          first_name: req.body.first_name || req.body["guests[0][first_name]"] || "",
          last_name: req.body.last_name || req.body["guests[0][last_name]"] || "",
          email: req.body.email || req.body["guests[0][email]"] || "",
          phone: req.body.phone || req.body["guests[0][phone]"] || "",
          father_name: req.body.father_name || req.body["guests[0][father_name]"] || "",
          gender: req.body.gender || req.body["guests[0][gender]"] || "",
          occupation: req.body.occupation || req.body["guests[0][occupation]"] || "",
          date_of_birth: req.body.date_of_birth || req.body["guests[0][date_of_birth]"] || "",
          nationality: req.body.nationality || req.body["guests[0][nationality]"] || "",
          guest_details: {
            country: req.body["guests[0][guest_details][country]"] || "",
            state: req.body["guests[0][guest_details][state]"] || "",
            city: req.body["guests[0][guest_details][city]"] || "",
            zip_code: req.body["guests[0][guest_details][zip_code]"] || "",
            address: req.body["guests[0][guest_details][address]"] || "",
            comment: req.body["guests[0][guest_details][comment]"] || "",
            document_type: req.body["guests[0][guest_details][document_type]"] || "",
            frontend_url: req.body["guests[0][guest_details][frontend_url]"] || "",
          },
        };

        if (directGuest.first_name.trim()) {
          guestsData.push(directGuest);
        }
      }
    }

    if (guestsData.length === 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "At least one guest with a first name is required",
        debug: {
          availableKeys: Object.keys(req.body),
          guestKeys: Object.keys(req.body).filter(key => key.includes('guest'))
        }
      });
    }

    const bookingData = {
      // room_id: req.body.room_id,
      rooms:req.body.rooms,
      total_rooms:req.body.total_rooms,
      check_in_date_time: req.body.check_in_date_time,
      check_out_date_time: req.body.check_out_date_time,
      booking_type: req.body.booking_type,
      purpose_of_visit: req.body.purpose_of_visit,
      remarks: req.body.remarks,
      total_amount: parseFloat(req.body.total_amount) || 0,
      reason: req.body.reason || "",
      extra_bed: parseInt(req.body.extra_bed) || 0,
      services: req.body.services ?req.body.services : [],
      arrival_from: req.body.arrival_from || "",
      booking_reference_no: req.body.booking_reference_no || "",
      guests: guestsData,
      payment_status:req.body.payment_status,
      package_ids:req.body.package_ids || []
    };

    const reservation = await roomReservation.createRoomBooking(bookingData, req);

    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Reservation created successfully",
      data: reservation,
    });
  } catch (error) {
    console.error("Reservation creation error:", error);
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to create reservation",
    });
  }
});

const calculatedPrices = catchAsync(async (req, res) => {
  try {
    let bodyData = req.body
    
    if (!bodyData.rooms || bodyData.rooms.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "Rooms are required")
    }
    
    // Use the shared calculation function
    const priceCalculation = await roomReservation.calculateReservationPrices(bodyData)
    return res.status(httpStatus.OK).json({
      success: true,
      message: "Price calculation completed successfully",
      data: {
        data: priceCalculation,
        payload: bodyData
      },
    })
  } catch (error) {
    console.error("Price calculation error:", error)
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to calculate prices",
    })
  }
})

const updateReservation = catchAsync(async (req, res) => {
  try {
    const { reservation_id } = req.params
     const guestsData = []

    const guestKeys = Object.keys(req.body).filter((key) => key.startsWith("guests"))

    if (guestKeys.length > 0) {
      const guestIndices = [
        ...new Set(
          guestKeys.map((key) => {
            const match = key.match(/guests\[(\d+)\]/)
            return match ? Number.parseInt(match[1]) : null
          }),
        ),
      ]
        .filter((index) => index !== null)
        .sort((a, b) => a - b)

      console.log("Guest indices found for update:", guestIndices)

      guestIndices.forEach((index) => {
        const guest = {
          first_name: req.body[`guests[${index}][first_name]`] || "",
          last_name: req.body[`guests[${index}][last_name]`] || "",
          email: req.body[`guests[${index}][email]`] || "",
          phone: req.body[`guests[${index}][phone]`] || "",
          father_name: req.body[`guests[${index}][father_name]`] || "",
          gender: req.body[`guests[${index}][gender]`] || "",
          occupation: req.body[`guests[${index}][occupation]`] || "",
          date_of_birth: req.body[`guests[${index}][date_of_birth]`] || "",
          nationality: req.body[`guests[${index}][nationality]`] || "",
          guest_details: {
            country: req.body[`guests[${index}][guest_details][country]`] || "",
            state: req.body[`guests[${index}][guest_details][state]`] || "",
            city: req.body[`guests[${index}][guest_details][city]`] || "",
            zip_code: req.body[`guests[${index}][guest_details][zip_code]`] || "",
            address: req.body[`guests[${index}][guest_details][address]`] || "",
            comment: req.body[`guests[${index}][guest_details][comment]`] || "",
            document_type: req.body[`guests[${index}][guest_details][document_type]`] || "",
            frontend_url: req.body[`guests[${index}][guest_details][frontend_url]`] || "",
          },
        }

        console.log(`Processing guest ${index} for update:`, guest)

        if (guest.first_name.trim()) {
          guestsData.push(guest)
        }
      })
    }

    if (guestsData.length === 0) {
      console.log("No guests parsed from array format for update, checking alternatives...")

      if (req.body.guests) {
        try {
          let parsedGuests
          if (typeof req.body.guests === "string") {
            parsedGuests = JSON.parse(req.body.guests)
          } else {
            parsedGuests = req.body.guests
          }

          if (Array.isArray(parsedGuests) && parsedGuests.length > 0) {
            parsedGuests.forEach((guest) => {
              if (guest.first_name && guest.first_name.trim()) {
                guestsData.push(guest)
              }
            })
          }
        } catch (parseError) {
          console.log("Failed to parse guests JSON for update:", parseError)
        }
      }

      if (guestsData.length === 0) {
        const directGuest = {
          first_name: req.body.first_name || req.body["guests[0][first_name]"] || "",
          last_name: req.body.last_name || req.body["guests[0][last_name]"] || "",
          email: req.body.email || req.body["guests[0][email]"] || "",
          phone: req.body.phone || req.body["guests[0][phone]"] || "",
          father_name: req.body.father_name || req.body["guests[0][father_name]"] || "",
          gender: req.body.gender || req.body["guests[0][gender]"] || "",
          occupation: req.body.occupation || req.body["guests[0][occupation]"] || "",
          date_of_birth: req.body.date_of_birth || req.body["guests[0][date_of_birth]"] || "",
          nationality: req.body.nationality || req.body["guests[0][nationality]"] || "",
          guest_details: {
            country: req.body["guests[0][guest_details][country]"] || "",
            state: req.body["guests[0][guest_details][state]"] || "",
            city: req.body["guests[0][guest_details][city]"] || "",
            zip_code: req.body["guests[0][guest_details][zip_code]"] || "",
            address: req.body["guests[0][guest_details][address]"] || "",
            comment: req.body["guests[0][guest_details][comment]"] || "",
            document_type: req.body["guests[0][guest_details][document_type]"] || "",
            frontend_url: req.body["guests[0][guest_details][frontend_url]"] || "",
          },
        }

        if (directGuest.first_name.trim()) {
          guestsData.push(directGuest)
        }
      }
    }

    console.log("Final parsed guests data for update:", guestsData)

    if (guestsData.length === 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "At least one guest with a first name is required",
        debug: {
          availableKeys: Object.keys(req.body),
          guestKeys: Object.keys(req.body).filter((key) => key.includes("guest")),
        },
      })
    }

    const bookingData = {
      rooms: req.body.rooms,
      check_in_date_time: req.body.check_in_date_time,
      check_out_date_time: req.body.check_out_date_time,
      booking_type: req.body.booking_type,
      purpose_of_visit: req.body.purpose_of_visit,
      remarks: req.body.remarks,
      total_amount: Number.parseFloat(req.body.total_amount) || 0,
      reason: req.body.reason || "",
      extra_bed: Number.parseInt(req.body.extra_bed) || 0,
      services: req.body.package_ids ? req.body.package_ids : [],
      booking_status: req.body.booking_status,
      arrival_from: req.body.arrival_from || "",
      booking_reference_no: req.body.booking_reference_no || "",
      guests: guestsData,
    }

    console.log("Final booking data for update:", bookingData)

    const reservation = await roomReservation.updateReservation(reservation_id, bookingData, req)

    res.status(httpStatus.OK).json({
      success: true,
      message: "Reservation updated successfully",
      data: reservation,
    })
  } catch (error) {
    console.error("Reservation update error:", error)
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to update reservation",
    })
  }
})

const getallGuestReservation = catchAsync(async (req, res) => {
  const reservations = await roomReservation.getallGuestReservation(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: reservations,
    message: "Get all reservation successfully",
  });
});

const getGuestReservation = catchAsync(async (req, res) => {
const getReservations = await roomReservation.guestReservationDetails(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: getReservations,
    message: "All reservation fetched successfully",
  });
});

const changeOrReassignRoom = catchAsync(async (req, res) => {
  const assignRoom = await roomReservation.avaibilityToChangeRoom(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: assignRoom,
    message: "New room assign successfully",
  });
})

const quickRoomBooking = catchAsync(async (req, res) => {
  const quickBooking = await roomReservation.quickBookingReservatation(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: quickBooking,
    message: "Room booked successfully",
  });
})

const exportReservations = catchAsync(async (req, res) => {
  const format = req.query.format || 'csv';
  await roomReservation.exportReservations(format, res);
});

const getReservationLogs = catchAsync(async (req, res) => {
  const logs = await roomReservation.getLogsForReservation(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: logs,
    message: "Booking logs fetched successfully",
  });
});


const getAllRoomAvailability = catchAsync(async (req, res) => {
  const getAllRoom = await roomReservation.getRoomAvailability(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: getAllRoom,
    message: "Get all reservation successfully",
  });
});


const getReservations = catchAsync(async (req, res) => {
  const reservations = await roomReservation.fetchReservationsInRange(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reservations fetched successfully',
    data: reservations,
  });
});

const updateReservationRoomById= catchAsync(async (req,res)=>{
  const update_status = await roomReservation.updateBookingReservation(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: [],
    message: "Update reservation successfully",
  });
})

const getAllReservationDetailList= catchAsync(async (req,res)=>{
  const {reservation,pagination} = await roomReservation.getAllReservationData(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data:{reservation,pagination},
    message: "Fetch all details successfully",
  });
})

const createPayment = catchAsync(async (req, res) => {
  console.log("req.body",req.body)
    const payment = await roomReservation.createPaymentService(req.body);
    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Payment recorded successfully",
      data: payment,
    });
});

const CheckoutBookinng=catchAsync(async (req, res) => {
  const { reservationId } = req.params;
  const { payment_method, payment_amount, notes } = req.body;
  const processed_by = req.user?.id;
  console.log("reservationId",reservationId,processed_by)

  const checkoutResult = await roomReservation.processCheckout(
    reservationId,
    {
      payment_method, payment_amount, notes, processed_by
    },
    req.user?.id || "db1167fb-de69-4f0e-a257-0812311f4fab"
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Checkout processed successfully",
    data: checkoutResult
  });
});
module.exports = { getallGuestReservation, getGuestReservation,exportReservations, getReservations,calculatedPrices,
  changeOrReassignRoom, quickRoomBooking, createReservation, updateReservation,getAllRoomAvailability,getReservationLogs,updateReservationRoomById,getAllReservationDetailList 
,createPayment,CheckoutBookinng}
