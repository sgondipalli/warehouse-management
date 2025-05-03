'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Inbounds', {
      InboundID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      TradeItemID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'TradeItems',
          key: 'TradeItemID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      StorageBinID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'StorageBins',
          key: 'BinID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ReceivedQuantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      BatchNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      SupplierName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      DeliveryDocument: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ReceivedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW")
      },
      Remarks: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW")
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW")
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Inbounds');
  }
};
