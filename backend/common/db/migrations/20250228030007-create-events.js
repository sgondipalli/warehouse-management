'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      TransactionID: {
        type: Sequelize.INTEGER
      },
      TradeItemID: {
        type: Sequelize.INTEGER
      },
      BusinessPartnerID: {
        type: Sequelize.INTEGER
      },
      EventType: {
        type: Sequelize.STRING
      },
      Action: {
        type: Sequelize.STRING
      },
      BusinessStep: {
        type: Sequelize.STRING
      },
      Disposition: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Events');
  }
};