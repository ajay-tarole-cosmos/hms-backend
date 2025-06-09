const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/postgres.js");

class Amenity extends Model {}

Amenity.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    amenity_name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "The name of the amenity (e.g., 'Balcony', 'Air Conditioning').",
    },

    icon: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "URL or base64 icon representing the amenity.",
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
    modelName: "Amenity",
    tableName: "amenities",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Amenity.associate = (models) => {

};


module.exports = Amenity;
