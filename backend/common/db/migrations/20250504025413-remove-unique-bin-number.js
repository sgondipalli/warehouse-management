'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('StorageBins', 'StorageBins_BinNumber_key');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('StorageBins', {
      fields: ['BinNumber'],
      type: 'unique',
      name: 'StorageBins_BinNumber_key'
    });
  }
};
