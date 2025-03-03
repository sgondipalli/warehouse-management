'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("Roles", [
      { roleName: "Super Admin", description: "Manages the entire system, full access", createdAt: new Date(), updatedAt: new Date() },
      { roleName: "Warehouse Manager", description: "Oversees warehouse operations, assigns workers, manages inventory", createdAt: new Date(), updatedAt: new Date() },
      { roleName: "Warehouse Worker", description: "Performs inventory operations (pick, pack, ship), restricted to assigned warehouse", createdAt: new Date(), updatedAt: new Date() },
      { roleName: "Auditor/Compliance Officer", description: "Ensures compliance & security, views logs & reports", createdAt: new Date(), updatedAt: new Date() },
      { roleName: "Delivery Agent", description: "Handles outbound shipments, updates shipment status", createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("Roles", null, {});
  }
};

