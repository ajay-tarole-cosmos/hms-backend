const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First make supplier nullable
    await queryInterface.changeColumn('procurements', 'supplier', {
      type: DataTypes.STRING,
      allowNull: true
    });

    // Then remove the supplier column
    await queryInterface.removeColumn('procurements', 'supplier');
  },

  down: async (queryInterface, Sequelize) => {
    // Add supplier column back
    await queryInterface.addColumn('procurements', 'supplier', {
      type: DataTypes.STRING,
      allowNull: true
    });
  }
}; 