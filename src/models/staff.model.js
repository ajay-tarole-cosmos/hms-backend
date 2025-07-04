const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

const Staff = sequelize.define('Staff', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  hotel_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'hotels',
      key: 'id',
    },
    comment: "References the hotel this staff belongs to",
  },
  department_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id',
    },
    comment: "References the department this staff belongs to",
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },

  last_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },

  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Invalid email format',
      },
    },
  },

  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },

  role: {
    type: DataTypes.ENUM(
      'super_admin',
      'hotel_owner',
      'front_desk',
      'housekeeping',
      'restaurant_manager',
      'waiter',
      'inventory_manager',
      'accountant'
    ),
    allowNull: true,
    comment: "Role of the staff, e.g., Manager, Waiter, etc.",
  },

  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: true,
    defaultValue: 'active',
  },

  password: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: "Hashed password for staff login",
  },

  otp: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: "OTP for verification (password reset, etc.)",
  },

  otp_expiry: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: "OTP expiry timestamp",
  },

  otp_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: "Flag to indicate if OTP was verified for password reset",
  },
  access_token: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Access token for session authentication',
  },
  
  refresh_token: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Refresh token for renewing sessions',
  },
  has_global_access: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
}, {
  sequelize,
  modelName: 'Staff',
  tableName: 'staff',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

Staff.associate = function (models) {
  Staff.belongsTo(models.Hotels, {
    foreignKey: 'hotel_id',
    as: 'hotel',
  });

  Staff.hasMany(models.BookingLog, {
    foreignKey: 'performed_by',
    as: 'BookingLog',
  });

  Staff.hasMany(models.Payments, {
    foreignKey: 'processed_by',
    as: 'payment',
  });

  Staff.belongsTo(models.Department, {
    foreignKey: 'department_id',
    as: 'department',
  });

};

module.exports = Staff;
