'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('RolePermissions', [
      // Super Admin (Role ID 1) — full access
      { roleId: 1, permissionId: 1, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 1, permissionId: 2, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 1, permissionId: 3, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 1, permissionId: 4, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 1, permissionId: 5, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 1, permissionId: 6, createdAt: new Date(), updatedAt: new Date() },

      // Warehouse Manager (Role ID 2)
      { roleId: 2, permissionId: 1, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 2, permissionId: 2, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 2, permissionId: 3, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 2, permissionId: 4, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 2, permissionId: 6, createdAt: new Date(), updatedAt: new Date() },

      // Warehouse Worker (Role ID 3)
      { roleId: 3, permissionId: 3, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 3, permissionId: 4, createdAt: new Date(), updatedAt: new Date() },

      // Auditor/Compliance Officer (Role ID 4)
      { roleId: 4, permissionId: 5, createdAt: new Date(), updatedAt: new Date() },

      // Delivery Agent (Role ID 5)
      { roleId: 5, permissionId: 6, createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('RolePermissions', null, {});
  }
};
