'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('DeliveryAssignments', {
      AssignmentID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      OutboundDispatchID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'OutboundDispatches',
          key: 'DispatchID' // corrected
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      VehicleID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Vehicles',
          key: 'VehicleID' // correct
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      DeliveryAgentID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id' // correct
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      AssignedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      Status: {
        type: Sequelize.STRING,
        defaultValue: 'ASSIGNED'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('DeliveryAssignments');
  }
};
