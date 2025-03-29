'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Zones', {
      ZoneID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      LocationID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'LocationMaster',
          key: 'LocationID'
        },
        onDelete: 'CASCADE'
      },
      ZoneName: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Zones');
  }
};
