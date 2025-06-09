'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('room_status_history', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      room_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'rooms',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      reservation_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'reservations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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
