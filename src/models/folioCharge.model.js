const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/postgres.js");


class FolioCharge extends Model {}
FolioCharge.init(
    {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        folio_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "Folios",
            key: "id",
          },
        },
        charge_type: {
          // type: DataTypes.ENUM(
          //   "room_charge",
          //   "service_charge",
          //   "tax",
          //   "discount",
          //   "extra_bed",
          //   "amenity",
          //   "food_beverage",
          //   "laundry",
          //   "telephone",
          //   "internet",
          //   "parking",
          //   "other",
          // ),
          type: DataTypes.STRING(70),
          allowNull: false,
        },
        description: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        amount: {
          type: DataTypes.DECIMAL(10, 2),
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
        discount:{
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue:0
        },
        charge_date: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        posted_by: {
          type: DataTypes.UUID,
          references: {
            model: "Staff",
            key: "id",
          },
        },
        is_taxable: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        tax_rate: {
          type: DataTypes.DECIMAL(5, 2),
          defaultValue: 0.0,
        },
        notes: {
          type: DataTypes.TEXT,
        },
        payment_status: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        room_id: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        // service_id: {
        //   type: DataTypes.UUID,
        //   allowNull: true,
        // },
        item_type: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        item_description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        details: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "FolioCharge",
        tableName: "folio_charges",
        timestamps: true
      },
  );

FolioCharge.associate = (models) => {
    FolioCharge.belongsTo(models.Folio, { foreignKey: "folio_id", as: "folio" })
    FolioCharge.belongsTo(models.Staff, { foreignKey: "posted_by", as: "poster" })
};

module.exports = FolioCharge;
