const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

const RoomNumber = sequelize.define('RoomNumber',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        room_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            comment: "Room number like 1,2,3",
        },

        room_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        room_status: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "Current status of the room (e.g., Available, Occupied, Maintenance)",
        },

        floor_number: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        stanndard_checkout: {
            type: DataTypes.STRING,
            allowNull: true
        },

        is_available: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
    },
    {
        sequelize,
        modelName: "RoomNumber",
        tableName: "rooms_number",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    })

RoomNumber.associate = function (models) {
    RoomNumber.belongsTo(models.Room, {
        foreignKey: 'room_id',
        as: 'room'
    });
    // // RoomNumber.hasMany(models.Reservation, {
    // //     foreignKey: 'room_number_id',
    // //     as: 'reservations',
    // // });
    // RoomNumber.hasMany(models.RoomStatusHistory, {
    //     foreignKey: 'room_number_id',
    //     as: 'room_status_history',
    // });
    // RoomNumber.hasMany(models.BookingLog, {
    //     foreignKey: 'room_number_id',
    //     as: 'booking_logs',
    // });
    // RoomNumber.hasMany(models.RoomStatus, {
    //     foreignKey: 'room_id',
    //     as: 'statuses',
    //     onDelete: 'CASCADE',
    //     onUpdate: 'CASCADE',
    // });
};

module.exports = RoomNumber;