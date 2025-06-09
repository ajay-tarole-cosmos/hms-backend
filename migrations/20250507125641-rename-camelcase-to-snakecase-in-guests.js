'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('guests_table', 'firstName', 'first_name');
    await queryInterface.renameColumn('guests_table', 'lastName', 'last_name');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('guests_table', 'first_name', 'firstName');
    await queryInterface.renameColumn('guests_table', 'last_name', 'lastName');
  }
};
