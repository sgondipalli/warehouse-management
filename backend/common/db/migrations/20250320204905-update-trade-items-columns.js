'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get the current table structure
    const tableDesc = await queryInterface.describeTable("TradeItems");

    // Rename `id` to `TradeItemID` if needed
    if (tableDesc.id && !tableDesc.TradeItemID) {
      await queryInterface.renameColumn("TradeItems", "id", "TradeItemID");
    }

    // Add missing columns to match the Sequelize model
    const columnsToAdd = [
      { name: "GTIN", type: Sequelize.STRING, allowNull: false, unique: true },
      { name: "MaterialNumber", type: Sequelize.STRING, allowNull: false, unique: true },
      { name: "UnitOfMeasure", type: Sequelize.STRING, allowNull: false },
      { name: "TradeItemDescription", type: Sequelize.TEXT, allowNull: false },
      { name: "SerializationType", type: Sequelize.STRING, allowNull: true },
      { name: "ProfileRelevantCountry", type: Sequelize.STRING, allowNull: true },
      { name: "TradeItemCategory", type: Sequelize.STRING, allowNull: true },
      { name: "createdAt", type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      { name: "updatedAt", type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    ];

    for (const column of columnsToAdd) {
      if (!tableDesc[column.name]) {
        await queryInterface.addColumn("TradeItems", column.name, {
          type: column.type,
          allowNull: column.allowNull,
          unique: column.unique || false,
          defaultValue: column.defaultValue || null,
        });
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable("TradeItems");

    // Rename `TradeItemID` back to `id` if needed
    if (tableDesc.TradeItemID) {
      await queryInterface.renameColumn("TradeItems", "TradeItemID", "id");
    }

    // Remove added columns in the `up` function
    const columnNames = [
      "GTIN", "MaterialNumber", "UnitOfMeasure", "TradeItemDescription",
      "SerializationType", "ProfileRelevantCountry", "TradeItemCategory",
      "createdAt", "updatedAt"
    ];

    for (const column of columnNames) {
      if (tableDesc[column]) {
        await queryInterface.removeColumn("TradeItems", column);
      }
    }
  }
};
