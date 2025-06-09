const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/postgres.js");

class RoomPricing extends Model {}

RoomPricing.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    room_type_id: {
      type: DataTypes.UUID,
      references: {
          model: "rooms",
          key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
  },

    offer_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    room_type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "The type of room (e.g., Single, Double, Suite).",
    },

    offer_type: {
      type: DataTypes.ENUM("seasonal", "weekend"),
      allowNull: false,
      comment: "Type of discount - 'seasonal' or 'weekend'",
    },

    valid_date_from: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    valid_date_to: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    discount_value: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue:"00",
      comment: "Value of the discount (e.g., 10%)",
    },

  },
  {
    sequelize,
    modelName: "RoomPricing",
    tableName: "room_pricing",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

RoomPricing.associate = (models) => {
  RoomPricing.belongsTo(models.Room, { foreignKey: 'room_type_id' });
};

module.exports = RoomPricing;
