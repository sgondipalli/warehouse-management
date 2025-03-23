'use strict';
module.exports = (sequelize, DataTypes) => {
  const TradeItemCategoryMaster = sequelize.define("TradeItemCategoryMaster", {
    CategoryID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    CategoryCode: { type: DataTypes.STRING, allowNull: false },
    CategoryDescription: { type: DataTypes.STRING, allowNull: true }
  }, {
    timestamps: false,
    tableName: "TradeItemCategoryMaster"
  });
  return TradeItemCategoryMaster;
};