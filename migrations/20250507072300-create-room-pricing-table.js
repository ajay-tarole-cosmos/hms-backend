'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('room_pricing', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      offer_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      room_type: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "The type of room (e.g., Single, Double, Suite).",
      },
      offer_type: {
        type: Sequelize.ENUM('seasonal', 'weekend'),
        allowNull: false,
        comment: "Type of discount - 'seasonal' or 'weekend'",
      },
      valid_date_from: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      valid_date_to: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      discount_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: "00.00",
        comment: "Value of the discount (e.g., 10%)",
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
    await queryInterface.dropTable('room_pricing');
  },
};
