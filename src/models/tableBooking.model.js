const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

const TableBooking = sequelize.define('TableBooking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  table_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'FK to restaurant_tables.id',
  },
  guest_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'FK to guests.id (null for walk-in)',
  },
  walkin_name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Walk-in guest name',
  },
  booking_time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    required: true,
  },
  status: {
    type: DataTypes.ENUM('booked', 'completed', 'cancelled'),
    defaultValue: 'booked',
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'FK to restaurant_orders.id (if order placed with booking)',
  },
}, {
  sequelize,
  modelName: 'TableBooking',
  tableName: 'table_bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

TableBooking.associate = (db) => {
  TableBooking.belongsTo(db.RestaurantOrder, {
    foreignKey: 'order_id',
    as: 'order',
  });
  
  TableBooking.belongsTo(db.Guests, {
    foreignKey: 'guest_id',
    as: 'guest',
  });
  TableBooking.belongsTo(db.RestaurantTable, {
    foreignKey: 'table_id',
    as: 'table',
  });
  
  // TableBooking.belongsTo(db.RestaurantOrder, {
  //   foreignKey: 'order_id',
  //   as: 'order',
  // });
};
module.exports = TableBooking; 