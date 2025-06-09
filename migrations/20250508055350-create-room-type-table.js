'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('rooms_number', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },

      room_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        comment: "Room number like 1,2,3",
      },

      room_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      room_status: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Current status of the room (e.g., Available, Occupied, Maintenance)",
      },

      floor_number: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      stanndard_checkout: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      room_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'rooms', // table name of Room
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('rooms_number');
  },
};
