'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable("Orders");

    // Remove only if column exists
    if (table.AssignedWarehouseID) {
      await queryInterface.removeColumn("Orders", "AssignedWarehouseID");
    }

    await queryInterface.addColumn("Orders", "SourceWarehouseID", {
      type: Sequelize.INTEGER,
      allowNull: true, // temporarily allow null
      references: {
        model: "LocationMaster",
        key: "LocationID"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });

    await queryInterface.addColumn("Orders", "DestinationWarehouseID", {
      type: Sequelize.INTEGER,
      allowNull: true, // temporarily allow null
      references: {
        model: "LocationMaster",
        key: "LocationID"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable("Orders");

    if (!table.AssignedWarehouseID) {
      await queryInterface.addColumn("Orders", "AssignedWarehouseID", {
        type: Sequelize.INTEGER,
        references: {
          model: "LocationMaster",
          key: "LocationID"
        },
        allowNull: true
      });
    }

    if (table.SourceWarehouseID) {
      await queryInterface.removeColumn("Orders", "SourceWarehouseID");
    }

    if (table.DestinationWarehouseID) {
      await queryInterface.removeColumn("Orders", "DestinationWarehouseID");
    }
  }
};
