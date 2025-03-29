'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('StorageBins', {
      BinID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      BinNumber: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
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
      ZoneID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Zones',
          key: 'ZoneID'
        },
        onDelete: 'SET NULL'
      },
      RackID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Racks',
          key: 'RackID'
        },
        onDelete: 'SET NULL'
      },
      ShelfID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Shelves',
          key: 'ShelfID'
        },
        onDelete: 'SET NULL'
      },
      MaxCapacity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      CurrentStock: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('StorageBins');
  }
};
