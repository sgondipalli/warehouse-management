'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('StockLevels', {
      StockLevelID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      TradeItemID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'TradeItems',  // table name in DB
          key: 'TradeItemID',            
        },
        onDelete: 'CASCADE',
      },
      LocationID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {tableName: 'LocationMaster' },
          key: 'LocationID',
        },
        onDelete: 'CASCADE',
      },
      Quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      LastUpdated: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('StockLevels');
  },
};
