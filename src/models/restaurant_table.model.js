const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

const RestaurantTable = sequelize.define('RestaurantTable', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Table name or number',
  },
  status: {
    type: DataTypes.ENUM('available', 'occupied', 'reserved', 'out_of_service'),
    defaultValue: 'available',
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'RestaurantTable',
  tableName: 'restaurant_tables',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

RestaurantTable.associate = (db) => {
  RestaurantTable.hasMany(db.RestaurantOrder, {
    foreignKey: 'table_id',
    as: 'orders',
  });

  RestaurantTable.hasMany(db.TableBooking, {
    foreignKey: 'table_id',
    as: 'bookings',
  });
};

module.exports = RestaurantTable; 