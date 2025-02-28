'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const Transactions = sequelize.define("Transactions", {
    TransactionID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    DocumentType: { type: DataTypes.STRING, allowNull: false },
    DocumentNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
    ShipFromGLN: { type: DataTypes.STRING, allowNull: false },
    ShipToGLN: { type: DataTypes.STRING, allowNull: false },
    BusinessTransactionType: { type: DataTypes.STRING, allowNull: false },
    BusinessPartnerID: { type: DataTypes.INTEGER, allowNull: false },
    LocationID: { type: DataTypes.INTEGER, allowNull: false }
  });

  Transactions.associate = (models) => {
    Transactions.belongsTo(models.BusinessPartner, { foreignKey: "BusinessPartnerID" });
    Transactions.belongsTo(models.LocationMaster, { foreignKey: "LocationID" });
    Transactions.hasMany(models.Events, { foreignKey: "TransactionID" });
  };

  return Transactions;
};
