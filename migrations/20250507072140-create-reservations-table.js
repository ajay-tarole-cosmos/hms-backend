'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ensure UUID extension exists (only needed once per DB)
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryInterface.createTable('reservations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      guest_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'guests_table',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      room_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'rooms',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      assigned_by: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'User who assigned the reservation',
      },
      check_in_date_time: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      check_out_date_time: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      purpose_of_visit: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      remarks: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Reason for blocking the room (e.g., Maintenance, Reserved)',
      },
      booking_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      booking_type: {
        type: Sequelize.STRING(70),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('reservations');
  }
};
