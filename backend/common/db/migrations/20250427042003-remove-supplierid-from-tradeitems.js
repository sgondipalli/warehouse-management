'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('TradeItems', 'SupplierID');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('TradeItems', 'SupplierID', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Suppliers',
        key: 'SupplierID',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  }
};
