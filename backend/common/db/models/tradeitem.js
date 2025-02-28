'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const TradeItem = sequelize.define("TradeItem", {
    TradeItemID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    GTIN: { type: DataTypes.STRING, unique: true, allowNull: false },
    MaterialNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
    UnitOfMeasure: { type: DataTypes.STRING, allowNull: false },
    TradeItemDescription: { type: DataTypes.TEXT, allowNull: false },
    SerializationType: { type: DataTypes.STRING, allowNull: true },
    ProfileRelevantCountry: { type: DataTypes.STRING, allowNull: true }
  });

  TradeItem.associate = (models) => {
    TradeItem.hasMany(models.SerialNumbers, { foreignKey: "TradeItemID" });
    TradeItem.hasMany(models.Validations, { foreignKey: "TradeItemID" });
    TradeItem.hasMany(models.StockLevels, { foreignKey: "TradeItemID" });
    TradeItem.hasMany(models.PickingOrders, { foreignKey: "TradeItemID" });
    TradeItem.hasMany(models.WarehouseMovements, { foreignKey: "TradeItemID" });
  };

  return TradeItem;
};
