const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

const RoomStatus = sequelize.define('RoomStatus', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  room_id: {
    type: DataTypes.UUID,
    references: {
      model: 'rooms_number',
      key: 'id',
    },
    allowNull: false,
  },
  room_status: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: "Current status of the room (e.g., Available, Occupied, Maintenance)",
  },
  check_in_date_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  check_out_date_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'RoomStatus',
  tableName: 'rooms_status',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

RoomStatus.associate = function (models) {
  // RoomStatus.belongsTo(models.RoomNumber, {
  //   foreignKey: 'room_id',
  //   as: 'room',
  //   onDelete: 'CASCADE',
  //   onUpdate: 'CASCADE',
  // });
};

module.exports = RoomStatus;
