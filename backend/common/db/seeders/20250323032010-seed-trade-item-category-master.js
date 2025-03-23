'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const categories = [
      { CategoryCode: "ELEC", CategoryDescription: "Electronics" },
      { CategoryCode: "FOOD", CategoryDescription: "Food & Beverages" },
      { CategoryCode: "PHARMA", CategoryDescription: "Pharmaceuticals" },
    ];
    await queryInterface.bulkInsert('TradeItemCategoryMaster', categories);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('TradeItemCategoryMaster', null, {});
  }
};
