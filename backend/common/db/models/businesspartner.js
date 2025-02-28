'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const BusinessPartner = sequelize.define("BusinessPartner", {
    BusinessPartnerID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    RoleNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
    RoleType: { type: DataTypes.STRING, allowNull: false },
    BPName: { type: DataTypes.STRING, allowNull: false },
    GLN: { type: DataTypes.STRING, unique: true, allowNull: true },
    GCP: { type: DataTypes.STRING, unique: true, allowNull: true }
  });

  BusinessPartner.associate = (models) => {
    BusinessPartner.hasMany(models.Transactions, { foreignKey: "BusinessPartnerID" });
    BusinessPartner.hasMany(models.Events, { foreignKey: "BusinessPartnerID" });
  };

  return BusinessPartner;
};
