const { Op } = require('sequelize');
const { TableBooking, RestaurantTable, RestaurantOrder, RestaurantOrderItem } = require('../models');
const paginate = require('../models/plugins/paginate.plugin');

exports.bookTable = async (data) => {
  const { table_id, guest_id, walkin_name, order_items, booking_time } = data;
  const requestedTime = booking_time ? new Date(booking_time) : new Date();

  const windowStart = new Date(requestedTime.getTime() - 2 * 60 * 60 * 1000);
  const windowEnd = new Date(requestedTime.getTime() + 2 * 60 * 60 * 1000);

  const overlappingBooking = await TableBooking.findOne({
    where: {
      table_id,
      status: 'booked',
      booking_time: { [Op.between]: [windowStart, windowEnd] },
    },
  });

  if (overlappingBooking) {
    const nextAvailable = new Date(overlappingBooking.booking_time.getTime() + 2 * 60 * 60 * 1000);
    if (requestedTime < nextAvailable) {
      const diffHours = Math.ceil((nextAvailable - requestedTime) / (60 * 60 * 1000));
      throw new Error(`You can book a table after ${diffHours} hour${diffHours > 1 ? 's' : ''}`);
    }
    throw new Error('Table is already booked for this time slot.');
  }

  let order = null;
  if (order_items?.length) {
    order = await RestaurantOrder.create({
      table_id,
      guest_id: guest_id || null,
      status: 'open',
    });

    for (const item of order_items) {
      await RestaurantOrderItem.create({
        ...item,
        order_id: order.id,
        total_price: item.unit_price * item.quantity,
      });
    }
  }

  const booking = await TableBooking.create({
    table_id,
    guest_id: guest_id || null,
    walkin_name: walkin_name || null,
    booking_time: requestedTime,
    status: 'booked',
    order_id: order ? order.id : null,
  });

  const now = new Date();
  if (
    requestedTime <= now &&
    requestedTime >= new Date(now.getTime() - 2 * 60 * 60 * 1000)
  ) {
    await RestaurantTable.update({ status: 'occupied' }, { where: { id: table_id } });
  }

  return booking;
};

exports.getTableStatus = async (id) => {
  const table = await RestaurantTable.findByPk(id);
  if (!table) throw new Error('Table not found');

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const recentBooking = await TableBooking.findOne({
    where: {
      table_id: id,
      status: 'booked',
      booking_time: { [Op.gt]: twoHoursAgo },
    },
  });

  let status = 'available';
  if (recentBooking) status = 'occupied';
  else if (table.status === 'out_of_service') status = 'out_of_service';

  return { id: table.id, name: table.name, status };
};

exports.listBookings = async (query) => {
  const filter = {};
  if (query.table_id) filter.table_id = query.table_id;
  if (query.guest_id) filter.guest_id = query.guest_id;

  return paginate(TableBooking, filter, {
    limit: query.limit,
    page: query.page,
    sortBy: [['booking_time', 'desc']],
    include: [], // add associations if needed
  });
};

exports.updateTableBooking = async (id, data) => {
  const booking = await TableBooking.findByPk(id);
  if (!booking) throw new Error('Booking not found');

  const { booking_time, guest_id, walkin_name, order_items } = data;

  if (booking_time) {
    const requestedTime = new Date(booking_time);
    const windowStart = new Date(requestedTime.getTime() - 2 * 60 * 60 * 1000);
    const windowEnd = new Date(requestedTime.getTime() + 2 * 60 * 60 * 1000);

    const overlappingBooking = await TableBooking.findOne({
      where: {
        table_id: booking.table_id,
        status: 'booked',
        id: { [Op.ne]: id },
        booking_time: { [Op.between]: [windowStart, windowEnd] },
      },
    });
    if (overlappingBooking) {
      throw new Error('Table is already booked for this time slot.');
    }
    booking.booking_time = requestedTime;
  }

  if (guest_id !== undefined) booking.guest_id = guest_id;
  if (walkin_name !== undefined) booking.walkin_name = walkin_name;

  await booking.save();

  if (order_items && booking.order_id) {
    await RestaurantOrderItem.destroy({ where: { order_id: booking.order_id } });
    for (const item of order_items) {
      await RestaurantOrderItem.create({
        ...item,
        order_id: booking.order_id,
        total_price: item.unit_price * item.quantity,
      });
    }
  }

  return booking;
};

exports.cancelTableBooking = async (id) => {
  const booking = await TableBooking.findByPk(id);
  if (!booking) throw new Error('Booking not found');

  booking.status = 'cancelled';
  await booking.save();

  const now = new Date();
  if (
    booking.booking_time <= now &&
    booking.booking_time >= new Date(now.getTime() - 2 * 60 * 60 * 1000)
  ) {
    await RestaurantTable.update({ status: 'available' }, { where: { id: booking.table_id } });
  }

  return booking;
};
