'use strict';

const countries = require('i18n-iso-countries');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const existing = await queryInterface.sequelize.query(
      `SELECT COUNT(*) FROM "CountryMaster";`
    );

    // Prevent re-seeding if already populated
    const count = parseInt(existing[0][0].count, 10);
    if (count > 0) {
      console.log("CountryMaster already seeded. Skipping...");
      return;
    }

    const countryCodes = countries.getAlpha2Codes();
    const countryData = Object.entries(countryCodes).map(([code, name]) => ({
      CountryName: name,
      ISOCode: code,
      CountryCode: '', // Optional: Add real dialing codes if needed
    }));

    await queryInterface.bulkInsert('CountryMaster', countryData);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('CountryMaster', null, {});
  }
};
