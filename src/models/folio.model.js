const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/postgres.js");

class Folio extends Model { }

Folio.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
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
        folio_number: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("active", "closed", "transferred"),
            defaultValue: "active",
        },
        total_charges: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        total_payments: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        balance: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        opened_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        closed_date: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        modelName: "Folio",
        tableName: "folios",
        timestamps: true
    }
);

Folio.associate = (models) => {
    Folio.belongsTo(models.Reservation, { foreignKey: "reservation_id", as: "reservation" })
    Folio.belongsTo(models.Guests, { foreignKey: "guest_id", as: "guest" })
    Folio.hasMany(models.FolioCharge, { foreignKey: "folio_id", as: "charges" });
    Folio.hasMany(models.Invoice, { foreignKey: "folio_id", as: "invoices" })

};


module.exports = Folio;
