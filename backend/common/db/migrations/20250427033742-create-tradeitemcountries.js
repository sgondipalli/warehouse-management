'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TradeItemCountries', {
      TradeItemCountryID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      TradeItemID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'TradeItems',
          key: 'TradeItemID'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      CountryCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('TradeItemCountries');
  }
};
