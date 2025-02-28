'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const StockLevels = sequelize.define("StockLevels", {
    StockLevelID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    TradeItemID: { type: DataTypes.INTEGER, allowNull: false },
    LocationID: { type: DataTypes.INTEGER, allowNull: false },
    Quantity: { type: DataTypes.INTEGER, allowNull: false },
    LastUpdated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  });

  StockLevels.associate = (models) => {
    StockLevels.belongsTo(models.TradeItem, { foreignKey: "TradeItemID" });
    StockLevels.belongsTo(models.LocationMaster, { foreignKey: "LocationID" });
  };

  return StockLevels;
};
