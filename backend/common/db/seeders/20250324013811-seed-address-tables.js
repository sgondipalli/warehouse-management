'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('AddressTables', [
      {
        Street: '221B Baker Street',
        HouseNumber: '221B',
        City: 'London',
        PostalCode: 'NW1 6XE',
        Country: 'GB', // ISO 3166-1 alpha-2 for United Kingdom
        Region: 'Greater London',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        Street: '1600 Amphitheatre Parkway',
        HouseNumber: '1600',
        City: 'Mountain View',
        PostalCode: '94043',
        Country: 'US', // United States
        Region: 'California',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        Street: 'Hauptstraße',
        HouseNumber: '5A',
        City: 'Berlin',
        PostalCode: '10115',
        Country: 'DE', // Germany
        Region: 'Berlin',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('AddressTables', null, {});
  }
};
