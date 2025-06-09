const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/postgres.js");

class Payments extends Model { }

Payments.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    invoice_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Invoices",
        key: "id",
      },
    },
    guest_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Guests",
        key: "id",
      },
    },
    reservation_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Reservations",
        key: "id",
      },
    },
    payment_method: {
      type: DataTypes.ENUM("cash", "credit_card", "debit_card", "bank_transfer", "upi", "cheque", "other"),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    transaction_id: {
      type: DataTypes.STRING,
    },
    reference_number: {
      type: DataTypes.STRING,
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
      defaultValue: "completed",
    },
    notes: {
      type: DataTypes.TEXT,
    },
    processed_by: {
      type: DataTypes.UUID,
      references: {
        model: "Staff",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Payments",
    tableName: "payments",
    timestamps: true,
  }
);

Payments.associate = (models) => {
  Payments.belongsTo(models.Invoice, { foreignKey: "invoice_id", as: "invoice" })
  Payments.belongsTo(models.Reservation, { foreignKey: "reservation_id", as: "reservation" })
  Payments.belongsTo(models.Staff, { foreignKey: "processed_by", as: "processor" })

};


module.exports = Payments;