'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const StorageBin = sequelize.define("StorageBin", {
    BinID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    LocationID: { type: DataTypes.INTEGER, allowNull: false },
    BinNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
    MaxCapacity: { type: DataTypes.INTEGER, allowNull: false },
    CurrentStock: { type: DataTypes.INTEGER, allowNull: false }
  });

  StorageBin.associate = (models) => {
    StorageBin.belongsTo(models.LocationMaster, { foreignKey: "LocationID" });
  };

  return StorageBin;
};
