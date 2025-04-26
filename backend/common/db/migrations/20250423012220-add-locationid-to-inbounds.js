// In migrations/xxxx-add-locationid-to-inbounds.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Inbounds", "LocationID", {
      type: Sequelize.INTEGER,
      allowNull: true, // make false if you want to enforce it
      references: {
        model: "LocationMaster",
        key: "LocationID"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Inbounds", "LocationID");
  }
};
