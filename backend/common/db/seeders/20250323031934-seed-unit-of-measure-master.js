'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const units = [
      { UOMCode: "EA", UOMDescription: "Each" },
      { UOMCode: "KG", UOMDescription: "Kilogram" },
      { UOMCode: "L", UOMDescription: "Litre" },
      { UOMCode: "BOX", UOMDescription: "Box" },
    ];
    await queryInterface.bulkInsert('UnitOfMeasureMaster', units);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('UnitOfMeasureMaster', null, {});
  }
};
