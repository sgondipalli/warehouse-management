'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('StorageBins', 'RackID', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Racks',
        key: 'RackID'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('StorageBins', 'RackID');
  }
};
