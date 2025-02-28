'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Validations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ValidationType: {
        type: Sequelize.STRING
      },
      ObjectChecked: {
        type: Sequelize.STRING
      },
      TradeItemID: {
        type: Sequelize.INTEGER
      },
      Status: {
        type: Sequelize.STRING
      },
      ErrorMessage: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Validations');
  }
};