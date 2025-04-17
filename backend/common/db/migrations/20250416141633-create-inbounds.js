'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Inbounds', {
      InboundID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      TradeItemID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'TradeItems',
          key: 'TradeItemID'
        },
        onDelete: 'CASCADE'
      },
      StorageBinID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'StorageBins',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      ReceivedQuantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      BatchNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      SupplierName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      DeliveryDocument: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ReceivedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW")
      },
      Remarks: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ExpectedDeliveryDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      ReceivedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      ConditionOnArrival: {
        type: Sequelize.STRING,
        allowNull: true
      },
      PurchaseOrderNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW")
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW")
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Inbounds');
  }
};
