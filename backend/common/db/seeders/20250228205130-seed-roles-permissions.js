'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("Roles", [
      { roleName: "Admin", description: "Full Access", createdAt: new Date(), updatedAt: new Date() },
      { roleName: "Manager", description: "Manage Inventory", createdAt: new Date(), updatedAt: new Date() },
      { roleName: "Employee", description: "Limited Access", createdAt: new Date(), updatedAt: new Date() }
    ]);

    await queryInterface.bulkInsert("Permissions", [
      { permissionName: "CREATE_USER", description: "Create Users", createdAt: new Date(), updatedAt: new Date() },
      { permissionName: "DELETE_USER", description: "Delete Users", createdAt: new Date(), updatedAt: new Date() },
      { permissionName: "VIEW_TRANSACTIONS", description: "View Transactions", createdAt: new Date(), updatedAt: new Date() }
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete("Roles", null, {});
    await queryInterface.bulkDelete("Permissions", null, {});
  }
};
