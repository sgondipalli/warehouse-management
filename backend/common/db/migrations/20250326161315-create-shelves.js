'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Shelves', {
      ShelfID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      RackID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Racks',
          key: 'RackID'
        },
        onDelete: 'CASCADE'
      },
      ShelfNumber: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Shelves');
  }
};
