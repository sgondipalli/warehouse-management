'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Vehicles", "VehicleType", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "Truck"  // or any default type
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Vehicles", "VehicleType");
  }
};
