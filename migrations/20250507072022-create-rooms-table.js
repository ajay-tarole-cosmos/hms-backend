'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('rooms', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      room_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        comment: "Room number like 101, 202A",
      },
      room_name: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "Luxury room",
        comment: "The name of the room (e.g., 'Standard King Room', 'Deluxe Suite')",
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
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
        comment: "Per night price in currency unit",
      },
      floor: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Floor number the room is located on",
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
      is_available: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: "Indicates whether the room is currently available for booking.",
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
      hotel_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'hotels',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: "The hotel where this room is located.",
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "URL of the image representing the room.",
      },
      bed_type: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Type of bed available in the room (e.g., King, Queen, Twin)"
      },
      facilities: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        comment: "List of facilities provided with the room (e.g., AC, Heater, Balcony)"
      },
      tax: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: "Tax percentage applicable to the room rate"
      },
      badge: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Label for promotional or status badges (e.g., Deluxe, Suite, Most Booked)"
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
    await queryInterface.dropTable('rooms');
  }
};
