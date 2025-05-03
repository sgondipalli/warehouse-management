'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Racks', [
      { RackID: 1, ZoneID: 1, RackNumber: 'R1' },
      { RackID: 2, ZoneID: 2, RackNumber: 'R2' }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Racks', null, {});
  }
};
