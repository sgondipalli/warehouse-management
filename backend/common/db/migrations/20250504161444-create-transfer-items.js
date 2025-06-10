'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TransferItems', {
      TransferItemID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      TransferID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Transfers', key: 'TransferID' },
        onDelete: 'CASCADE'
      },
      TradeItemID: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      Quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('TransferItems');
  }
};
