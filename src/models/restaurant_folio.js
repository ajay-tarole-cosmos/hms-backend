const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

const RestaurantFolio = sequelize.define('RestaurantFolio', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  guest_type: {
    type: DataTypes.ENUM('hotel_guest', 'restaurant_guest'),
    allowNull: true,
  },
  guest_ref_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'References either guests.id or restaurant_users.id',
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'FK to restaurant_orders.id',
  },
  status: {
    type: DataTypes.ENUM('open', 'closed'),
    defaultValue: 'open',
  },
}, {
  sequelize,
  modelName: 'RestaurantFolio',
  tableName: 'restaurant_folios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

RestaurantFolio.associate = (db) => {
//   RestaurantFolio.belongsTo(db.Guests, { foreignKey: 'guest_id', as: 'guest' });
  RestaurantFolio.belongsTo(db.RestaurantOrder, { foreignKey: 'order_id', as: 'order' });
  RestaurantFolio.hasMany(db.RestaurantFolioCharge, { foreignKey: 'folio_id', as: 'restaurant_charges' });
  RestaurantFolio.hasMany(db.RestaurantInvoice, { foreignKey: 'folio_id', as: 'restaurant_invoices' });
};

module.exports = RestaurantFolio;
