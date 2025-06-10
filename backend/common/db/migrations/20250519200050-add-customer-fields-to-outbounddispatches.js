'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("OutboundDispatches", "CustomerName", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("OutboundDispatches", "CustomerAddress", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("OutboundDispatches", "CustomerName");
    await queryInterface.removeColumn("OutboundDispatches", "CustomerAddress");
  }
};
