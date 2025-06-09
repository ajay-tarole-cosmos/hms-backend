const { Op } = require("sequelize");
const Reservation = require("../models/reservation.model");


const generateUniqueBookingId = async () => {
  let bookingId;
  let exists;

  do {
    bookingId = Math.floor(100000 + Math.random() * 900000).toString(); 
    exists = await Reservation.findOne({
      where: {
        booking_id: bookingId
      }
    });
  } while (exists);

  return bookingId.toString();
};



module.exports = {generateUniqueBookingId}
