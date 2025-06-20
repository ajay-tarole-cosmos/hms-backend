const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/postgres.js");

class ProcurementRequest extends Model {}

ProcurementRequest.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    department_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'low',
    },
    required_by: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    justification: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    approved_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    invoice_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    invoice_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    invoice_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    invoice_files: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    // invoice_uploaded_at: {
    //   type: DataTypes.DATE,
    //   allowNull: true,
    // },
    // payment_status: {
    //   type: DataTypes.ENUM('pending', 'paid'),
    //   defaultValue: 'pending',
    // },
  },
  {
    sequelize,
    modelName: "ProcurementRequest",
    tableName: "procurement_requests",
    timestamps: true,
    underscored: true,
  }
);

// Define associations
ProcurementRequest.associate = (models) => {
  ProcurementRequest.hasMany(models.ProcurementRequestItem, {
    foreignKey: 'procurement_request_id',
    as: 'items',
    onDelete: 'CASCADE'
  });
  ProcurementRequest.belongsTo(models.Department, {
    foreignKey: 'department_id',
    as: 'department',
  });
  
  ProcurementRequest.belongsTo(models.DepartmentCategory, {
    foreignKey: 'category_id',
    as: 'category',
  });
};

module.exports = ProcurementRequest; 