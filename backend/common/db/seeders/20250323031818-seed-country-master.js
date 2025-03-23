'use strict';

const countries = require('i18n-iso-countries');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get country codes and names
    const countryCodes = countries.getAlpha2Codes();
    const countryData = Object.entries(countryCodes).map(([code, name]) => ({
      CountryName: name,
      ISOCode: code,
      CountryCode: '', // Placeholder; add actual dialing codes if available
    }));

    // Insert into CountryMaster table
    await queryInterface.bulkInsert('CountryMaster', countryData);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all entries from CountryMaster
    await queryInterface.bulkDelete('CountryMaster', null, {});
  }
};
