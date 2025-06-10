'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transfers', {
      TransferID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      FromWarehouseID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      ToWarehouseID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      RequestedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      Status: {
        type: Sequelize.STRING,
        defaultValue: 'PENDING', // or APPROVED, REJECTED, COMPLETED
      },
      Remarks: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Transfers');
  }
};
