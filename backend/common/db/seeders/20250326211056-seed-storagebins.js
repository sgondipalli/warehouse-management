'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('StorageBins', [
      {
        id: 1,
        BinNumber: 'BIN-001',
        LocationID: 1,
        ZoneID: 1,
        RackID: 1,
        ShelfID: 1,
        MaxCapacity: 100,
        CurrentStock: 20,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        BinNumber: 'BIN-002',
        LocationID: 1,
        ZoneID: 2,
        RackID: 2,
        ShelfID: 2,
        MaxCapacity: 200,
        CurrentStock: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});    
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('StorageBins', null, {});
  }
};
