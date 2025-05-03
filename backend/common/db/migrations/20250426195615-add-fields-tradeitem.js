'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('TradeItems', 'CreatedByUserID', { type: Sequelize.INTEGER });
    await queryInterface.addColumn('TradeItems', 'UpdatedByUserID', { type: Sequelize.INTEGER });
    await queryInterface.addColumn('TradeItems', 'Status', {
      type: Sequelize.ENUM('Active', 'Inactive'),
      defaultValue: 'Active'
    });
    await queryInterface.addColumn('TradeItems', 'isDeleted', { type: Sequelize.BOOLEAN, defaultValue: false });
    await queryInterface.addColumn('TradeItems', 'deletedAt', { type: Sequelize.DATE });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('TradeItems', 'CreatedByUserID');
    await queryInterface.removeColumn('TradeItems', 'UpdatedByUserID');
    await queryInterface.removeColumn('TradeItems', 'Status');
    await queryInterface.removeColumn('TradeItems', 'isDeleted');
    await queryInterface.removeColumn('TradeItems', 'deletedAt');
  }
};
