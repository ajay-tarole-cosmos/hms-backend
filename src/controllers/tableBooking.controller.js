// const { TableBooking, RestaurantTable, RestaurantOrder, RestaurantOrderItem, Guests } = require('../models');
// const { Op } = require('sequelize');

const { TableBookingService } = require("../services");

// // Book a table (with or without order)
// exports.bookTable = async (req, res) => {
//   try {
//     const { table_id, guest_id, walkin_name, order_items, booking_time } = req.body;
//     // Use provided booking_time or default to now
//     const requestedTime = booking_time ? new Date(booking_time) : new Date();
//     // Calculate the 2-hour window for overlap check
//     const windowStart = new Date(requestedTime.getTime() - 2 * 60 * 60 * 1000);
//     const windowEnd = new Date(requestedTime.getTime() + 2 * 60 * 60 * 1000);
//     // Check for overlapping bookings in the 2-hour window
//     const overlappingBooking = await TableBooking.findOne({
//       where: {
//         table_id,
//         status: 'booked',
//         booking_time: { [Op.between]: [windowStart, windowEnd] },
//       },
//     });
//     if (overlappingBooking) {
//       // Calculate when the table will be available again
//       const nextAvailable = new Date(overlappingBooking.booking_time.getTime() + 2 * 60 * 60 * 1000);
//       const diffMs = requestedTime - nextAvailable;
//       let message = 'Table is already booked for this time slot.';
//       if (requestedTime < nextAvailable) {
//         const diffHours = Math.ceil((nextAvailable - requestedTime) / (60 * 60 * 1000));
//         message = `You can book a table after ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
//       }
//       return res.status(400).json({ error: message });
//     }
//     // Optionally create an order
//     let order = null;
//     if (order_items && order_items.length > 0) {
//       order = await RestaurantOrder.create({
//         table_id,
//         guest_id: guest_id || null,
//         status: 'open',
//       });
//       // Add order items
//       for (const item of order_items) {
//         await RestaurantOrderItem.create({
//           ...item,
//           order_id: order.id,
//           total_price: item.unit_price * item.quantity,
//         });
//       }
//     }
//     // Create booking
//     const booking = await TableBooking.create({
//       table_id,
//       guest_id: guest_id || null,
//       walkin_name: walkin_name || null,
//       booking_time: requestedTime,
//       status: 'booked',
//       order_id: order ? order.id : null,
//     });
//     // Update table status if booking is for now
//     const now = new Date();
//     if (
//       requestedTime <= now &&
//       requestedTime >= new Date(now.getTime() - 2 * 60 * 60 * 1000)
//     ) {
//       await RestaurantTable.update({ status: 'occupied' }, { where: { id: table_id } });
//     }
//     res.status(201).json(booking);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// // Get table status (free/available/occupied, with 2-hour logic)
// exports.getTableStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const table = await RestaurantTable.findByPk(id);
//     if (!table) return res.status(404).json({ error: 'Table not found' });
//     // Check for recent booking
//     const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
//     const recentBooking = await TableBooking.findOne({
//       where: {
//         table_id: id,
//         status: 'booked',
//         booking_time: { [Op.gt]: twoHoursAgo },
//       },
//     });
//     let status = 'available';
//     if (recentBooking) status = 'occupied';
//     else if (table.status === 'out_of_service') status = 'out_of_service';
//     res.json({ id: table.id, name: table.name, status });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// // List all bookings (optionally filter by table or guest)
// exports.listBookings = async (req, res) => {
//   try {
//     const { table_id, guest_id } = req.query;
//     const where = {};
//     if (table_id) where.table_id = table_id;
//     if (guest_id) where.guest_id = guest_id;
//     const bookings = await TableBooking.findAll({ where });
//     res.json(bookings);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// // Update a table booking (change time, guest, etc.)
// exports.updateTableBooking = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { booking_time, guest_id, walkin_name, order_items } = req.body;
//     const booking = await TableBooking.findByPk(id);
//     if (!booking) return res.status(404).json({ error: 'Booking not found' });
//     // If booking_time is being updated, check for conflicts
//     if (booking_time) {
//       const requestedTime = new Date(booking_time);
//       const windowStart = new Date(requestedTime.getTime() - 2 * 60 * 60 * 1000);
//       const windowEnd = new Date(requestedTime.getTime() + 2 * 60 * 60 * 1000);
//       const overlappingBooking = await TableBooking.findOne({
//         where: {
//           table_id: booking.table_id,
//           status: 'booked',
//           id: { [Op.ne]: id },
//           booking_time: { [Op.between]: [windowStart, windowEnd] },
//         },
//       });
//       if (overlappingBooking) {
//         return res.status(400).json({ error: 'Table is already booked for this time slot.' });
//       }
//       booking.booking_time = requestedTime;
//     }
//     if (guest_id !== undefined) booking.guest_id = guest_id;
//     if (walkin_name !== undefined) booking.walkin_name = walkin_name;
//     await booking.save();
//     // Optionally update order items if provided
//     if (order_items && booking.order_id) {
//       await RestaurantOrderItem.destroy({ where: { order_id: booking.order_id } });
//       for (const item of order_items) {
//         await RestaurantOrderItem.create({
//           ...item,
//           order_id: booking.order_id,
//           total_price: item.unit_price * item.quantity,
//         });
//       }
//     }
//     res.json(booking);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// // Cancel a table booking
// exports.cancelTableBooking = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const booking = await TableBooking.findByPk(id);
//     if (!booking) return res.status(404).json({ error: 'Booking not found' });
//     booking.status = 'cancelled';
//     await booking.save();
//     // Optionally update table status if this was the current booking
//     const now = new Date();
//     if (
//       booking.booking_time <= now &&
//       booking.booking_time >= new Date(now.getTime() - 2 * 60 * 60 * 1000)
//     ) {
//       await RestaurantTable.update({ status: 'available' }, { where: { id: booking.table_id } });
//     }
//     res.json({ message: 'Booking cancelled', booking });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// }; 

exports.bookTable = async (req, res) => {
  try {
    const result = await TableBookingService.bookTable(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getTableStatus = async (req, res) => {
  try {
    const result = await TableBookingService.getTableStatus(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.listBookings = async (req, res) => {
  try {
    const result = await TableBookingService.listBookings(req.query);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateTableBooking = async (req, res) => {
  try {
    const result = await TableBookingService.updateTableBooking(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.cancelTableBooking = async (req, res) => {
  try {
    const result = await TableBookingService.cancelTableBooking(req.params.id);
    res.json({ message: 'Booking cancelled', booking: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
