const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

class BookingLog extends Model {}

BookingLog.init( {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    reservation_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'reservations',
            key: 'id',
        },
        comment: "References the reservation related to this log entry",
    },

    action: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "Action performed, e.g., 'created', 'cancelled', 'updated'",
    },

    performed_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'staff',
            key: 'id',
        },
        comment: "ID of the staff who performed the action",
    },

    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: "Timestamp of when the action was performed",
    },

    remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Any additional remarks or details about the action",
    },
    guest_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'guests_table',
            key: 'id',
        },
        comment: "Guest involved in the log entry",
    },

    room_number_ids: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: true,
        defaultValue: [],
        comment: "Array of room numbers associated with the log entry",
    },
}, {
    sequelize,
    modelName: 'BookingLog',
    tableName: 'booking_logs',
    timestamps: false,
});

BookingLog.associate = function (models) {
    BookingLog.belongsTo(models.Reservation, {
        foreignKey: 'reservation_id',
        as: 'reservation',
    });

    BookingLog.belongsTo(models.Staff, {
        foreignKey: 'performed_by',
        as: 'staff',
    });

    BookingLog.belongsTo(models.Guests, {
        foreignKey: 'guest_id',
        as: 'guest',
    });

    // BookingLog.belongsTo(models.RoomNumber, {
    //     foreignKey: 'room_number_id',
    //     as: 'room_number',
    // });
};

module.exports = BookingLog;
