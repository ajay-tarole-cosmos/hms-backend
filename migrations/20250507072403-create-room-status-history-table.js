'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('room_status_history', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      room_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: "References the room whose status has changed.",
      },
      reservation_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: "References the reservation that caused the status change.",
      },
      changed_by: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: "User ID who changed the status.",
      },
      change_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Reason for the change (e.g., guest extended stay).",
      },
      changed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: "Timestamp when the status was changed.",
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Additional notes, if any.",
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('room_status_history');
  },
};
