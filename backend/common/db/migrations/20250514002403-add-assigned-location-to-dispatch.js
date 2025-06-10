'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('OutboundDispatches', 'AssignedLocationID', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'LocationMaster', // table name
        key: 'LocationID'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('OutboundDispatches', 'AssignedLocationID');
  }
};
