'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      guest_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "guests_table",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      reservation_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "reservations",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_mode: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isIn: [["cash", "card", "upi", "wallet"]],
        },
      },
      payment_status: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isIn: [["paid", "pending", "failed"]],
        },
      },
      transaction_id: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Transaction ID from payment gateway",
      },
      paid_at: {
        type: Sequelize.DATE,
        allowNull: true,
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
    await queryInterface.dropTable('payments');
  }
};
