'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Shelves', [
      { ShelfID: 1, RackID: 1, ShelfNumber: 'S1' },
      { ShelfID: 2, RackID: 2, ShelfNumber: 'S2' }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Shelves', null, {});
  }
};
