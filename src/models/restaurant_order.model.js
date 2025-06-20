const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

const RestaurantOrder = sequelize.define('RestaurantOrder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  table_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'FK to restaurant_tables.id',
  },
  guest_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Polymorphic: FK to either guests_table or restaurant_users',
  },
  guest_type: {
    type: DataTypes.ENUM('hotel_guest', 'restaurant_guest'),
    allowNull: true,
    comment: 'Specifies which table guest_id belongs to',
  },
  room_number_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'FK to room_numbers.id (for hotel guests)',
  },
  order_type: {
    type: DataTypes.ENUM('room_service', 'table_booking', 'parcel'),
    allowNull: false,
    defaultValue: 'booking',
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },
  booking_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tip: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0,
  },
  service_charge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0,
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'FK to staff.id',
  },
}, {
  sequelize,
  modelName: 'RestaurantOrder',
  tableName: 'restaurant_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});


RestaurantOrder.associate = (db) => {
  RestaurantOrder.belongsTo(db.RestaurantTable, {
    foreignKey: 'table_id',
    as: 'table',
  });

  RestaurantOrder.belongsTo(db.Guests, {
    foreignKey: 'guest_id',
    as: 'guest',
  });

  RestaurantOrder.belongsTo(db.RestaurantUser, {
    foreignKey: 'guest_id',
    as: 'restaurant_user',
  });

  RestaurantOrder.belongsTo(db.RoomNumber, {
    foreignKey: 'room_number_id',
    as: 'room',
  });

  RestaurantOrder.hasMany(db.RestaurantOrderItem, {
    foreignKey: 'order_id',
    as: 'items',
  });

  RestaurantOrder.hasOne(db.TableBooking, {
    foreignKey: 'order_id',
    as: 'booking',
  });
};

module.exports = RestaurantOrder;
