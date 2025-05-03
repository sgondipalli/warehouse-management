'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('LocationMaster', {
      LocationID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      LocationNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      LocationName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      LocationType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      GLN: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      GLN_Extension: {
        type: Sequelize.STRING,
        allowNull: true
      },
      AddressID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'AddressTables',
          key: 'id' 
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }

    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('LocationMaster');
  }
};
