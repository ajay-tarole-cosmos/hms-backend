const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

const Package = sequelize.define('Package', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: "e.g., Breakfast, Spa Access, Airport Pickup",
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Package',
  tableName: 'packages',
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

Package.associate = function (models) {
    Package.hasMany(models.RoomPackage, { 
        foreignKey: 'package_id',
        as: 'roomPackageLinks'
    });
    Package.belongsToMany(models.Room, {
        through: models.RoomPackage,
        foreignKey: 'package_id',
        as: 'rooms'
    });

  };

  
module.exports = Package;
