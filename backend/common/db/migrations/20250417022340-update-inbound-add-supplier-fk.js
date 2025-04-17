module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Inbounds", "SupplierID", {
      type: Sequelize.INTEGER,
      references: {
        model: "Suppliers",
        key: "SupplierID"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });

    await queryInterface.removeColumn("Inbounds", "SupplierName");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Inbounds", "SupplierName", {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.removeColumn("Inbounds", "SupplierID");
  }
};
