'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('guests_table', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING
      },
      country_code: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING(15)
      },
      father_name: {
        type: Sequelize.STRING(225),
        allowNull: true
      },
      gender: {
        type: Sequelize.STRING(12),
        allowNull: true
      },
      occupation: {
        type: Sequelize.STRING(225),
        allowNull: true
      },
      date_of_birth: {
        type: Sequelize.STRING(14),
        allowNull: true
      },
      nationality: {
        type: Sequelize.STRING(75),
        allowNull: true
      },
      guest_vip: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('guests_table');
  }
};
