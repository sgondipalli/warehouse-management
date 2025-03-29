'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn('StorageBins', 'ShelfID', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Shelves',
        key: 'ShelfID'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('StorageBins', 'ShelfID');
  }
};
