const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

const RoomPackage = sequelize.define('RoomPackage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  room_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  package_id: {
    type: DataTypes.UUID,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'RoomPackage',
  tableName: 'room_packages',
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

RoomPackage.associate = function (models) {
    RoomPackage.belongsTo(models.Room, {
        foreignKey: 'room_id',
        as: 'room'
    });
    RoomPackage.belongsTo(models.Package, {
        foreignKey: 'package_id',
        as: 'package'
    });
  };
  

module.exports = RoomPackage;
