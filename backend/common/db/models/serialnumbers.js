'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const SerialNumbers = sequelize.define("SerialNumbers", {
    SerialID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    GTIN: { type: DataTypes.STRING, allowNull: false },
    TradeItemID: { type: DataTypes.INTEGER, allowNull: false },
    BusinessPartnerID: { type: DataTypes.INTEGER, allowNull: false },
    ProfileKey: { type: DataTypes.STRING, allowNull: false },
    Status: { type: DataTypes.STRING, allowNull: false }
  });

  SerialNumbers.associate = (models) => {
    SerialNumbers.belongsTo(models.TradeItem, { foreignKey: "TradeItemID" });
    SerialNumbers.belongsTo(models.BusinessPartner, { foreignKey: "BusinessPartnerID" });
  };

  return SerialNumbers;
};
