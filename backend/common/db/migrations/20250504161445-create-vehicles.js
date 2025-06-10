'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Vehicles', {
      VehicleID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      VehicleNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      DriverName: {
        type: Sequelize.STRING
      },
      ContactNumber: {
        type: Sequelize.STRING
      },
      Capacity: {
        type: Sequelize.INTEGER
      },
      Status: {
        type: Sequelize.STRING,
        defaultValue: 'AVAILABLE' // or ON_TRIP, MAINTENANCE
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
    await queryInterface.dropTable('Vehicles');
  }
};
