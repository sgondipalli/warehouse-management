'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Orders', 'CustomerName', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('Orders', 'CustomerAddress', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Orders', 'DeliveryType', {
      type: Sequelize.ENUM('W2W', 'W2C'),
      allowNull: false,
      defaultValue: 'W2W'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Orders', 'CustomerName', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('Orders', 'CustomerAddress', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.removeColumn('Orders', 'DeliveryType');
  }
};
