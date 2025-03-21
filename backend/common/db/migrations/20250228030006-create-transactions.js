'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      DocumentType: {
        type: Sequelize.STRING
      },
      DocumentNumber: {
        type: Sequelize.STRING
      },
      ShipFromGLN: {
        type: Sequelize.STRING
      },
      ShipToGLN: {
        type: Sequelize.STRING
      },
      SoldFromGLN: {
        type: Sequelize.STRING
      },
      SoldToGLN: {
        type: Sequelize.STRING
      },
      BusinessTransactionType: {
        type: Sequelize.STRING
      },
      BusinessPartnerID: {
        type: Sequelize.INTEGER
      },
      LocationID: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('Transactions');
  }
};