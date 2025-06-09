'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('room_meal_packages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Name of the special offer (e.g., Summer Special)",
      },
      includes: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false,
        comment: "What's included in the offer (e.g., Room + Breakfast)",
      },
      applicable_room_types: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        comment: "Room types this offer applies to.",
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      valid_from: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: "Start date for the offer.",
      },
      valid_to: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: "End date for the offer.",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('room_meal_packages');
  },
};
