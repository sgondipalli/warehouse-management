'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('OrderItems', {
      OrderItemID: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      OrderID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Orders", key: "OrderID" }
      },
      TradeItemID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "TradeItems", key: "TradeItemID" }
      },
      Quantity: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('OrderItems');
  }
};
