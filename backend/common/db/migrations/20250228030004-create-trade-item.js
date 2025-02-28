'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TradeItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      GTIN: {
        type: Sequelize.STRING
      },
      MaterialNumber: {
        type: Sequelize.STRING
      },
      UnitOfMeasure: {
        type: Sequelize.STRING
      },
      TradeItemDescription: {
        type: Sequelize.TEXT
      },
      SerializationType: {
        type: Sequelize.STRING
      },
      ProfileRelevantCountry: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('TradeItems');
  }
};