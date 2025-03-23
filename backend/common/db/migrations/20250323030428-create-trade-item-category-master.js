'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("TradeItemCategoryMaster", {
      CategoryID: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      CategoryCode: { type: Sequelize.STRING, allowNull: false },
      CategoryDescription: { type: Sequelize.STRING }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("TradeItemCategoryMaster");
  }
};
