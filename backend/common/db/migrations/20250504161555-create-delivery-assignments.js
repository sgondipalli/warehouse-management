'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('DeliveryAssignments', {
      AssignmentID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      OutboundDispatchID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'OutboundDispatches',
          key: 'DispatchID',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      DeliveryAgentID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      AssignmentStatus: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Assigned',
      },
      AssignedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      DeliveredAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      Remarks: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('DeliveryAssignments');
  },
};
