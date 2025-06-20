const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

const RestaurantInvoiceItem = sequelize.define('RestaurantInvoiceItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  invoice_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'FK to invoices.id',
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
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
}, {
  sequelize,
  modelName: 'RestaurantInvoiceItem',
  tableName: 'restaurant_invoice_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

RestaurantInvoiceItem.associate = (db) => {
  RestaurantInvoiceItem.belongsTo(db.RestaurantInvoice, { foreignKey: 'invoice_id', as: 'restaurant_invoice' });
};

module.exports = RestaurantInvoiceItem;
