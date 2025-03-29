'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Racks', {
      RackID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ZoneID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Zones',
          key: 'ZoneID'
        },
        onDelete: 'CASCADE'
      },
      RackNumber: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Racks');
  }
};
