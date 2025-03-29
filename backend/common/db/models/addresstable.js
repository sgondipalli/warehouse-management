'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const AddressTable = sequelize.define("AddressTable", {
    id: { 
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Street: { type: DataTypes.STRING, allowNull: false },
    HouseNumber: { type: DataTypes.STRING, allowNull: false },
    City: { type: DataTypes.STRING, allowNull: false },
    PostalCode: { type: DataTypes.STRING, allowNull: false },
    Country: { type: DataTypes.STRING, allowNull: false },
    Region: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'AddressTables' 
  });

  AddressTable.associate = (models) => {
    models.LocationMaster.belongsTo(AddressTable, { foreignKey: "AddressID" });
    AddressTable.hasMany(models.BusinessPartner, { foreignKey: "AddressID" });
  };

  return AddressTable;
};
