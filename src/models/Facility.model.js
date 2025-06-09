const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/postgres.js");

class Facility extends Model {}

Facility.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    facility_name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "The name of the facility (e.g., 'Free toiletries', 'Shower').",
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Facility",
    tableName: "facilities",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Facility.associate = (models) => {

};

module.exports = Facility;
