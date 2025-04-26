'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('UserLocationAccesses', 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    });

    await queryInterface.addColumn('UserLocationAccesses', 'updatedAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('UserLocationAccesses', 'createdAt');
    await queryInterface.removeColumn('UserLocationAccesses', 'updatedAt');
  },
};
