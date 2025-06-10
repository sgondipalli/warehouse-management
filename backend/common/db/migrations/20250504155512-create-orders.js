'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Orders', {
      OrderID: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      CustomerName: { type: Sequelize.STRING, allowNull: false },
      CustomerAddress: { type: Sequelize.STRING, allowNull: false },
      OrderDate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      Status: {
        type: Sequelize.ENUM("PENDING", "ALLOCATED", "DISPATCHED", "DELIVERED", "CANCELLED"),
        defaultValue: "PENDING"
      },
      AssignedWarehouseID: {
        type: Sequelize.INTEGER,
        references: { model: "LocationMaster", key: "LocationID" },
        allowNull: true
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Orders');
  }
};
