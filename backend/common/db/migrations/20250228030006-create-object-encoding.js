'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ObjectEncodings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ObjectType: {
        type: Sequelize.STRING
      },
      EncodingFormat: {
        type: Sequelize.STRING
      },
      Owner: {
        type: Sequelize.STRING
      },
      Product: {
        type: Sequelize.STRING
      },
      Serial: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ObjectEncodings');
  }
};