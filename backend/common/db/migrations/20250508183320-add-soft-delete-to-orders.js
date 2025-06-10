'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Orders", "isDeleted", {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn("Orders", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Orders", "isDeleted");
    await queryInterface.removeColumn("Orders", "deletedAt");
  }
};
