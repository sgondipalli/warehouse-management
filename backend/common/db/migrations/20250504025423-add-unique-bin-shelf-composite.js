'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('StorageBins', {
      fields: ['BinNumber', 'ShelfID'],
      type: 'unique',
      name: 'unique_bin_per_shelf'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('StorageBins', 'unique_bin_per_shelf');
  }
};
