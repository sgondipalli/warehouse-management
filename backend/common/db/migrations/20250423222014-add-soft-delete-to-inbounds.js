'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Inbounds');

    if (!table.deletedAt) {
      await queryInterface.addColumn("Inbounds", "deletedAt", {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    // Skip isDeleted if already exists
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Inbounds", "isDeleted").catch(() => {});
    await queryInterface.removeColumn("Inbounds", "deletedAt").catch(() => {});
  }
};
