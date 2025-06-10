module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Orders", "CreatedByUserID", {
      type: Sequelize.INTEGER,
      references: {
        model: "Users",
        key: "id"
      },
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Orders", "CreatedByUserID");
  }
};
