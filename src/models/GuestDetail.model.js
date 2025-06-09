const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/postgres.js");

class GuestDetail extends Model {}

GuestDetail.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    guest_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, 
      references: {
        model: "Guests",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    document_type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "e.g. passport, ID card, Aadhar, visa",
    },
    frontend_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "URL accessible from the frontend",
    },
    backend_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Private/internal URL (e.g. watermarked or original file)",
    },
    mime_type: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "e.g. image/png, application/pdf",
    },
    uploaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "State of the guest, if applicable (e.g. California)",
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "State of the guest, if applicable (e.g. California)",
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "City of the guest (e.g. San Francisco)",
    },
    zip_code: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Zip code of the guest",
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Full address of the guest",
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Additional comments or notes about the document",
    },
  },
  {
    sequelize,
    modelName: "GuestDetail",
    tableName: "guest_details", 
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

GuestDetail.associate = (models) => {
  GuestDetail.belongsTo(models.Guests, {
    foreignKey: "guest_id",
    as: "guest",
  });
};

module.exports = GuestDetail;
