const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

const RestaurantPayment = sequelize.define('RestaurantPayment', {
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
  method: {
    type: DataTypes.ENUM("cash", "credit_card", "debit_card", "bank_transfer", "upi", "cheque", "other"),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paid_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'RestaurantPayment',
  tableName: 'restaurant_payments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

RestaurantPayment.associate = (db) => {
  RestaurantPayment.belongsTo(db.RestaurantInvoice, { foreignKey: 'invoice_id', as: 'restaurant_invoice' });
};

module.exports = RestaurantPayment;
