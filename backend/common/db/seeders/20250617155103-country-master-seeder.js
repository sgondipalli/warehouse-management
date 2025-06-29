'use strict';

const countries = require('i18n-iso-countries');

module.exports = {
  async up(queryInterface, Sequelize) {
    countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

    const allCountries = countries.getNames('en', { select: 'official' });

    const dialCodes = {
      US: '+1', IN: '+91', DE: '+49', GB: '+44', CA: '+1',
      AU: '+61', FR: '+33', JP: '+81', CN: '+86', BR: '+55',
      RU: '+7', IT: '+39', ES: '+34', MX: '+52', KR: '+82',
      ZA: '+27', NG: '+234', AR: '+54', EG: '+20', TR: '+90',
      ID: '+62', SA: '+966', AE: '+971', PK: '+92', BD: '+880'
    };

    const countryEntries = Object.entries(allCountries).map(([isoCode, name]) => ({
      CountryName: name,
      ISOCode: isoCode,
      CountryCode: dialCodes[isoCode] || null
    }));

    await queryInterface.bulkInsert('CountryMaster', countryEntries, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CountryMaster', null, {});
  }
};
