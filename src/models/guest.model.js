const { DataTypes, Model, Op } = require("sequelize");
const { sequelize } = require("../config/postgres.js");

class Guests extends Model {}
Guests.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
      trim: true,
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: { msg: "Invalid email" },
      },
    },
    country_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(15),
      trim: true,
      validate: {
        is: {
          args: /^[+]*[0-9]{1,4}[-\s]?[0-9]{1,14}$/i,
          msg: "Phone number must be valid",
        }
      },
    },
    father_name: {
      type: DataTypes.STRING(225),
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING(12),
      allowNull: true
    },
    occupation: {
      type: DataTypes.STRING(225),
      allowNull: true
    },
    date_of_birth: {
      type: DataTypes.STRING(14),
      allowNull: true
    },
    nationality: {
      type: DataTypes.STRING(75),
      allowNull: true
    },
    guest_vip: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deleted_by: {
      type: DataTypes.STRING(75),
      allowNull: true
    },
    date_of_delete: {
      type: DataTypes.STRING(75),
      allowNull: true
    },
    agent_name: {
      type: DataTypes.STRING(75),
      allowNull: true
    },
    booking_source: {
      type: DataTypes.STRING(75),
      allowNull: true
    },
  },
  {
    sequelize,
    modelName: "Guests",
    tableName: "guests_table",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Guests.associate = (models) => {
  Guests.hasMany(models.Reservation, {
    foreignKey: "guest_id",
    as: "reservations",
  });
  Guests.hasOne(models.GuestDetail, {
    foreignKey: "guest_id",
    as: "guest_details",
  });

  Guests.hasMany(models.Payments, {
    foreignKey: 'guest_id',
    as: 'payments',
  });
  Guests.hasMany(models.BookingLog, {
    foreignKey: 'guest_id',
    as: 'booking_logs',
  });
  Guests.hasMany(models.Invoice, { foreignKey: "guest_id", as: "invoices" });
  Guests.hasMany(models.Folio, { foreignKey: "guest_id", as: "folios" })
};

module.exports = Guests;