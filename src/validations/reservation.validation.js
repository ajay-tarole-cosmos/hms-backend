const moment = require("moment")
const ApiError = require("../utils/ApiError")
const httpStatus = require("http-status")

// Enhanced date validation utility
const validateReservationDates = (checkInDateTime, checkOutDateTime) => {
  // Parse dates
  const checkIn = moment(checkInDateTime)
  const checkOut = moment(checkOutDateTime)

  // Check if dates are valid
  if (!checkIn.isValid() || !checkOut.isValid()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format. Please use YYYY-MM-DDTHH:MM format.")
  }

  // Check if check-in is in the past (allow same day)
  const today = moment().startOf("day")
  const checkInDay = checkIn.clone().startOf("day")

  if (checkInDay.isBefore(today)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Check-in date cannot be in the past.")
  }

  // Check if check-out is after check-in
  if (checkOut.isSameOrBefore(checkIn)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Check-out date must be after check-in date.")
  }

  // Check minimum stay (at least 1 hour)
  const hoursDifference = checkOut.diff(checkIn, "hours")
  if (hoursDifference < 1) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Minimum stay duration is 1 hour.")
  }

  // Check maximum stay (not more than 365 days)
  const daysDifference = checkOut.diff(checkIn, "days")
  if (daysDifference > 365) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Stay duration cannot exceed 365 days.")
  }

  // Check if check-in time is reasonable (not too late at night for same day)
  if (checkInDay.isSame(today) && checkIn.hour() < 6) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Same-day check-in cannot be before 6:00 AM.")
  }

  return {
    checkIn: checkIn.toISOString(),
    checkOut: checkOut.toISOString(),
    nights: Math.ceil(daysDifference),
    hours: hoursDifference,
  }
}

module.exports = {
  validateReservationDates,
}
