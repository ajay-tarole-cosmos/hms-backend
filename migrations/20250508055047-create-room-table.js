'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('rooms', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },

      number_of_room: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        comment: "Room number like 1,2,3",
      },

      room_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
        comment: "Per night price in currency unit",
      },

      extra_bed: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Detailed description of the room, such as view, amenities, or layout.",
      },

      amenities: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        comment: "List of amenities available in the room (e.g., Wi-Fi, TV, Mini-bar)",
      },

      room_size: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },

      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Maximum number of people the room can accommodate.",
      },

      bed_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Maximum number of beds available in the room.",
      },

      image_url: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "URL of the image representing the room.",
      },

      bed_type: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Type of bed available in the room (e.g., King, Queen, Twin)",
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
    await queryInterface.dropTable('rooms');
  },
};
