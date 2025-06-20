const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/postgres.js");

class Invoice extends Model {}

Invoice.init(
    {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        invoice_number: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: false,
        },
        reservation_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "Reservations",
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
        subtotal: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0.0,
        },
        tax_amount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0.0,
        },
        discount_amount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0.0,
        },
        total_amount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        paid_amount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0.0,
        },
        balance_amount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0.0,
        },
        status: {
          type: DataTypes.ENUM("draft", "sent", "paid", "partially_paid", "overdue", "cancelled"),
          defaultValue: "draft",
        },
        invoice_date: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        due_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        notes: {
          type: DataTypes.TEXT,
        },
        pdf_path: {
          type: DataTypes.STRING,
        },
        email_sent: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        email_sent_at: {
          type: DataTypes.DATE,
        },
      },
  {
    sequelize,
    modelName: "Invoice",
    tableName: "invoices",
    timestamps: true
  }
);

Invoice.associate = (models) => {
    Invoice.belongsTo(models.Reservation, { foreignKey: "reservation_id", as: "reservation" })
    Invoice.belongsTo(models.Guests, { foreignKey: "guest_id", as: "guest" })
    Invoice.hasMany(models.InvoiceItem, { foreignKey: "invoice_id", as: "items" })
    Invoice.hasMany(models.Payments, { foreignKey: "invoice_id", as: "payments" })
    Invoice.belongsTo(models.Folio, { foreignKey: "folio_id", as: "folio" })
};


module.exports = Invoice;
