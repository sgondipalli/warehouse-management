'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('StockLevels', 'StorageBinID', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'StorageBins',
        key: 'BinID'
      },
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('StockLevels', 'StorageBinID');
  }
};
