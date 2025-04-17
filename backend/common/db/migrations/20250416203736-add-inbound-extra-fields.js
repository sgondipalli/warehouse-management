'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('Inbounds', 'ExpectedDeliveryDate', {
        type: Sequelize.DATE,
        allowNull: true
      }),
      queryInterface.addColumn('Inbounds', 'ReceivedBy', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      }),
      queryInterface.addColumn('Inbounds', 'ConditionOnArrival', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('Inbounds', 'PurchaseOrderNumber', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('Inbounds', 'isDeleted', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }),
      queryInterface.addColumn('Inbounds', 'deletedAt', {
        type: Sequelize.DATE,
        allowNull: true
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('Inbounds', 'ExpectedDeliveryDate'),
      queryInterface.removeColumn('Inbounds', 'ReceivedBy'),
      queryInterface.removeColumn('Inbounds', 'ConditionOnArrival'),
      queryInterface.removeColumn('Inbounds', 'PurchaseOrderNumber'),
      queryInterface.removeColumn('Inbounds', 'isDeleted'),
      queryInterface.removeColumn('Inbounds', 'deletedAt'),
    ]);
  }
};
