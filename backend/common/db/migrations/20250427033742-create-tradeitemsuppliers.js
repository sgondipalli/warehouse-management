'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TradeItemSuppliers', {
      TradeItemSupplierID: {
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
      SupplierID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Suppliers',
          key: 'SupplierID'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      isPrimary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    await queryInterface.dropTable('TradeItemSuppliers');
  }
};
