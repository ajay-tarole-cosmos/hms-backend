const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

const RestaurantOrderItem = sequelize.define('RestaurantOrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'FK to restaurant_orders.id',
  },
  variant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'FK to variants.id',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'RestaurantOrderItem',
  tableName: 'restaurant_order_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

RestaurantOrderItem.associate = (db) => {
  RestaurantOrderItem.belongsTo(db.RestaurantOrder, {
    foreignKey: 'order_id',
    as: 'order',
  });

  RestaurantOrderItem.belongsTo(db.Variant, {
    foreignKey: 'variant_id',
    as: 'variant',
  });
};


module.exports = RestaurantOrderItem; 