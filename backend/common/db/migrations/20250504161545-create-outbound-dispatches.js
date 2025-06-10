'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('OutboundDispatches', {
      DispatchID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      OrderItemID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'OrderItems', key: 'OrderItemID' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      SourceWarehouseID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      DestinationWarehouseID: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      DispatchDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      DeliveryAgentID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      VehicleID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Vehicles', key: 'VehicleID' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      Status: {
        type: Sequelize.STRING,
        defaultValue: 'Dispatched'
      },
      Remarks: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('OutboundDispatches');
  }
};
