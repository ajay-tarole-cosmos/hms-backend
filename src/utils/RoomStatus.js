const RoomStatus = {
    AVAILABLE: 'available',
    OCCUPIED: 'occupied',
    CLEANING: 'cleaning in progress',
    OUT_OF_ORDER: 'out of order',
    MAINTENANCE:'maintenance',
    BOOKED:'booked'
  };

const RoomBookingStatus = {
  CHECK_IN:"check_in",
  CHECK_OUT:"check_out",
  BOOKED:"booked",
  CANCELLED:"cancelled"
}
  
module.exports = {RoomStatus,RoomBookingStatus};
  