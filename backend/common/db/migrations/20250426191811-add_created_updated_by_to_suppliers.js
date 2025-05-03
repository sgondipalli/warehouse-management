'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Suppliers', 'CreatedByUserID', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('Suppliers', 'UpdatedByUserID', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Suppliers', 'CreatedByUserID');
    await queryInterface.removeColumn('Suppliers', 'UpdatedByUserID');
  }
};
