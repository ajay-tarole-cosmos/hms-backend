const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

const RestaurantInvoice = sequelize.define('RestaurantInvoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  folio_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'FK to restaurant_folios.id',
  },
  invoice_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  issued_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'RestaurantInvoice',
  tableName: 'restaurant_invoices',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

RestaurantInvoice.associate = (db) => {
  RestaurantInvoice.belongsTo(db.RestaurantFolio, { foreignKey: 'folio_id', as: 'folio' });
  RestaurantInvoice.hasMany(db.RestaurantInvoiceItem, { foreignKey: 'invoice_id', as: 'restaurant_items' });
  RestaurantInvoice.hasMany(db.RestaurantPayment, { foreignKey: 'invoice_id', as: 'restaurant_payments' });
};

module.exports = RestaurantInvoice;
