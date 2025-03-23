'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("UnitOfMeasureMaster", {
      UOMID: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      UOMCode: { type: Sequelize.STRING, allowNull: false },
      UOMDescription: { type: Sequelize.STRING }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("UnitOfMeasureMaster");
  }
};
