const { DataTypes, Model, Op } = require("sequelize")
const { sequelize } = require("../config/postgres.js")
const BookingLog = require("./bookingLogs.model.js");

class Reservation extends Model {}

Reservation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    guest_id: {
      type: DataTypes.UUID,
      allowNull: false, // Fixed: should not be null
      references: {
        model: "guests_table", // Fixed: correct table name
        key: "id", // Fixed: correct key name
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    rooms: {
      type: DataTypes.JSONB, // or DataTypes.UUID if IDs
      allowNull: false,
      defaultValue: [],
    },
    total_rooms: {
      type: DataTypes.INTEGER,
    },
    check_in_date_time: {
      type: DataTypes.DATE,
      allowNull: false, // Fixed: should not be null
    },
    check_out_date_time: {
      type: DataTypes.DATE,
      allowNull: false, // Fixed: should not be null
    },
    purpose_of_visit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT, // Changed to TEXT for longer content
      allowNull: true,
    },
    reason: {
      type: DataTypes.TEXT, // Changed to TEXT for longer content
      allowNull: true,
      comment: "Reason for blocking the room (e.g., Maintenance, Reserved).",
    },
    booking_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Added unique constraint
    },
    booking_type: {
      type: DataTypes.STRING,
      //   type: DataTypes.ENUM("online", "walk-in", "phone", "agent"), // Fixed: added enum values
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    booking_status: {
      type: DataTypes.ENUM("check_in", "booked", "check_out", "cancelled"),
      allowNull: false,
      defaultValue: "booked",
    },
    services: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [], // Added default value
    },
    additional_guests: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: true,
      defaultValue: [], // Added default value
      comment: "Array of UUIDs for accompanying guests",
    },
    // Added missing fields for better tracking
    checked_in_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    checked_out_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Reservation",
    tableName: "reservations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    // Added indexes for better performance
    indexes: [
      {
        fields: ["booking_status"],
      },
      {
        fields: ["check_in_date_time", "check_out_date_time"],
      },
      {
        fields: ["guest_id"],
      },
      {
        fields: ["room_number_id"],
      },
    ],
  },
)

Reservation.associate = (models) => {
  Reservation.belongsTo(models.Guests, {
    foreignKey: "guest_id",
    as: "guest",
  })
  // Reservation.belongsTo(models.RoomNumber, {
  //     foreignKey: "room_number_id",
  //     as: "room_number",
  // })
  Reservation.hasMany(models.RoomStatusHistory, {
    foreignKey: "reservation_id",
    as: "room_status_changes",
    onDelete: "CASCADE",
  })
  Reservation.hasMany(models.Payments, {
    foreignKey: "reservation_id",
    as: "payments",
    onDelete: "CASCADE",
  })
  Reservation.hasMany(models.BookingLog, {
    foreignKey: "reservation_id",
    as: "booking_logs",
  })
  Reservation.hasMany(models.Folio, {
    foreignKey: "reservation_id",
    as: "folios",
  })
  Reservation.hasMany(models.Invoice, {
    foreignKey: "reservation_id",
    as: "invoices",
  })
}

// Fixed hooks with proper error handling
Reservation.addHook("afterCreate", async (reservation, options) => {
  try {
    const { BookingLog } = require("../models")
    await BookingLog.create({
      reservation_id: reservation.id,
      guest_id: reservation.guest_id,
      room_number_id: reservation.room_number_id,
      action: "created",
      performed_by: options.userId || null,
      remarks: options.remark || "Reservation created",
    })
  } catch (error) {
    console.error("Error creating booking log:", error)
  }
})

Reservation.addHook("afterUpdate", async (reservation, options) => {
  try {
    const { BookingLog } = require("../models")
    await BookingLog.create({
      reservation_id: reservation.id,
      guest_id: reservation.guest_id,
      room_number_id: reservation.room_number_id,
      action: "updated",
      performed_by: options.userId || null,
      remarks: options.remark || "Reservation updated",
    })
  } catch (error) {
    console.error("Error creating booking log:", error)
  }
})

Reservation.addHook("afterDestroy", async (reservation, options) => {
  try {
    const { BookingLog } = require("../models")
    await BookingLog.create({
      reservation_id: reservation.id,
      guest_id: reservation.guest_id,
      room_number_id: reservation.room_number_id,
      action: "deleted",
      performed_by: options.userId || null,
      remarks: options.remark || "Reservation deleted",
    })
  } catch (error) {
    console.error("Error creating booking log:", error)
  }
})

module.exports = Reservation
