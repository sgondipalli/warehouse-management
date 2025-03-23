'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("SerializationTypeMaster", {
      SerializationTypeID: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      TypeCode: { type: Sequelize.STRING, allowNull: false },
      TypeDescription: { type: Sequelize.STRING }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("SerializationTypeMaster");
  }
};
