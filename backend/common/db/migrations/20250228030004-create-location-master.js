'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LocationMasters', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      LocationNumber: {
        type: Sequelize.STRING
      },
      LocationName: {
        type: Sequelize.STRING
      },
      LocationType: {
        type: Sequelize.STRING
      },
      GLN: {
        type: Sequelize.STRING
      },
      GLN_Extension: {
        type: Sequelize.STRING
      },
      AddressID: {
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
    await queryInterface.dropTable('LocationMasters');
  }
};