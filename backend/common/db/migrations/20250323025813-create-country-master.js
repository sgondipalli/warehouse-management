'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("CountryMaster", {
      CountryID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      CountryName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ISOCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      CountryCode: {
        type: Sequelize.STRING
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("CountryMaster");
  }
};