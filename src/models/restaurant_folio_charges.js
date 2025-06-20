const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

const RestaurantFolioCharge = sequelize.define('RestaurantFolioCharge', {
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
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  
}, {
  sequelize,
  modelName: 'RestaurantFolioCharge',
  tableName: 'restaurant_folio_charges',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

RestaurantFolioCharge.associate = (db) => {
  RestaurantFolioCharge.belongsTo(db.RestaurantFolio, { foreignKey: 'folio_id', as: 'folio' });
};

module.exports = RestaurantFolioCharge;
