'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AddressTables', { 
      id: { 
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      Street: {
        type: Sequelize.STRING,
        allowNull: false
      },
      HouseNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      City: {
        type: Sequelize.STRING,
        allowNull: false
      },
      PostalCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      Country: {
        type: Sequelize.STRING,
        allowNull: false
      },
      Region: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('AddressTables'); 
  }
};
