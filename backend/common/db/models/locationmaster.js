'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const LocationMaster = sequelize.define("LocationMaster", {
    LocationID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    LocationNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
    LocationName: { type: DataTypes.STRING, allowNull: false },
    LocationType: { type: DataTypes.STRING, allowNull: false },
    GLN: { type: DataTypes.STRING, unique: true, allowNull: true },
    GLN_Extension: { type: DataTypes.STRING, allowNull: true },
    AddressID: { type: DataTypes.INTEGER, allowNull: true }
  });

  LocationMaster.associate = (models) => {
    LocationMaster.belongsTo(models.AddressTable, { foreignKey: "AddressID" });
    // LocationMaster.hasMany(models.TradeItem, { foreignKey: "LocationID" });
    LocationMaster.hasMany(models.Transactions, { foreignKey: "LocationID" });
    LocationMaster.hasMany(models.Events, { foreignKey: "LocationID" });
    LocationMaster.hasMany(models.StorageBin, { foreignKey: "LocationID" });
  };

  return LocationMaster;
};
