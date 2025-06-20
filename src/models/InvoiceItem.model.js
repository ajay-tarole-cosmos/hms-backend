const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/postgres.js");

class InvoiceItem extends Model { }

InvoiceItem.init(
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
        item_type: {
            type: DataTypes.STRING(70),
            // type: DataTypes.ENUM("room_charge", "service_charge", "tax", "discount", "extra_bed", "amenity", "other"),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        unit_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        date_charged: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        is_taxable: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        discount:{
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue:0
          }, 
          tax_rate: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0.0,
          },
          tax_amount: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
          },
          payment_status: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
          },
    },
    {
        sequelize,
        modelName: "InvoiceItem",
        tableName: "invoice_items",
        timestamps: true,
    }
);

InvoiceItem.associate = (models) => {
    InvoiceItem.belongsTo(models.Invoice, { foreignKey: "invoice_id", as: "invoice" })
};

module.exports = InvoiceItem;
