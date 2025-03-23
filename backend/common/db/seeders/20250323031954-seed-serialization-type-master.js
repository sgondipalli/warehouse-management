'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const types = [
      { TypeCode: "SGTIN", TypeDescription: "Serialized Global Trade Item Number" },
      { TypeCode: "SSCC", TypeDescription: "Serial Shipping Container Code" },
      { TypeCode: "LGTIN", TypeDescription: "Lot-based GTIN" },
    ];
    await queryInterface.bulkInsert('SerializationTypeMaster', types);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('SerializationTypeMaster', null, {});
  }
};
