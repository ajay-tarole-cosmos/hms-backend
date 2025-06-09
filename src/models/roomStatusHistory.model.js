const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/postgres.js");

class RoomStatusHistory extends Model {}

RoomStatusHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    room_number_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "References the room whose status has changed.",
    },

    reservation_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "References the reservation that caused the status change.",
    },
    change_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Reason for the change (e.g., guest extended stay).",
    },

    changed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Timestamp when the status was changed.",
    },

    canncelled_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Timestamp when the status was changed.",
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Additional notes, if any.",
    },
  },
  {
    sequelize,
    modelName: "RoomStatusHistory",
    tableName: "room_status_history",
    timestamps: false, 
  }
);

  RoomStatusHistory.associate = (models) => {
    // RoomStatusHistory.belongsTo(models.RoomNumber, {
    //   foreignKey: 'room_number_id',
    //   as: 'room',
    //   onDelete: 'CASCADE',
    //   onUpdate: 'CASCADE',
    // });
  
    RoomStatusHistory.belongsTo(models.Reservation, {
      foreignKey: 'reservation_id',
      as: 'reservation',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  
    // RoomStatusHistory.belongsTo(models.User, {
    //   foreignKey: 'changed_by',
    //   as: 'changer',
    //   onDelete: 'SET NULL',
    //   onUpdate: 'CASCADE',
    // });

};

module.exports = RoomStatusHistory;
