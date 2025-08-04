'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("OutboundDispatches", "IsFinalLeg", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });

    await queryInterface.addColumn("OutboundDispatches", "ParentDispatchID", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "OutboundDispatches", // Self-referencing FK
        key: "DispatchID"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("OutboundDispatches", "IsFinalLeg");
    await queryInterface.removeColumn("OutboundDispatches", "ParentDispatchID");
  }
};
