'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Permissions', [
      { id: 1, permissionName: 'MANAGE_USERS', description: 'Create, update, delete users', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, permissionName: 'VIEW_DASHBOARD', description: 'View dashboard analytics', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, permissionName: 'CREATE_INBOUND', description: 'Create inbound records', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, permissionName: 'UPDATE_STOCK', description: 'Update stock levels', createdAt: new Date(), updatedAt: new Date() },
      { id: 5, permissionName: 'VIEW_LOGS', description: 'Access audit/compliance logs', createdAt: new Date(), updatedAt: new Date() },
      { id: 6, permissionName: 'DISPATCH_ORDERS', description: 'Mark orders as shipped', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Permissions', null, {});
  }
};
