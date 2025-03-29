'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('StorageBins', 'ZoneID', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Zones',
        key: 'ZoneID'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('StorageBins', 'ZoneID');
  }
};
