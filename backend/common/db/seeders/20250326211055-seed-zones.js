'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Zones', [
      { ZoneID: 1, LocationID: 1, ZoneName: 'Zone A' },
      { ZoneID: 2, LocationID: 1, ZoneName: 'Zone B' }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Zones', null, {});
  }
};
