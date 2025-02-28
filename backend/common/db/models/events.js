'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const Events = sequelize.define("Events", {
    EventID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    EventType: { type: DataTypes.STRING, allowNull: false },
    Action: { type: DataTypes.STRING, allowNull: false },
    BusinessStep: { type: DataTypes.STRING, allowNull: false },
    Disposition: { type: DataTypes.STRING, allowNull: true },
    LocationID: { type: DataTypes.INTEGER, allowNull: false },
    TradeItemID: { type: DataTypes.INTEGER, allowNull: false },
    BusinessPartnerID: { type: DataTypes.INTEGER, allowNull: false },
    TransactionID: { type: DataTypes.INTEGER, allowNull: false }
  });

  Events.associate = (models) => {
    Events.belongsTo(models.LocationMaster, { foreignKey: "LocationID" });
    Events.belongsTo(models.TradeItem, { foreignKey: "TradeItemID" });
    Events.belongsTo(models.BusinessPartner, { foreignKey: "BusinessPartnerID" });
    Events.belongsTo(models.Transactions, { foreignKey: "TransactionID" });
  };

  return Events;
};
