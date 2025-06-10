'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("DeliverySchedules", {
      ScheduleID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      DeliveryAgentID: { type: Sequelize.INTEGER, allowNull: false },
      VehicleID: { type: Sequelize.INTEGER, allowNull: false },
      DispatchDate: { type: Sequelize.DATEONLY, allowNull: false },
      Status: { type: Sequelize.STRING, defaultValue: "ASSIGNED" },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("DeliverySchedules");
  }
};
