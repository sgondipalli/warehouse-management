'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const Validations = sequelize.define("Validations", {
    ValidationID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ValidationType: { type: DataTypes.STRING, allowNull: false },
    ObjectChecked: { type: DataTypes.STRING, allowNull: false },
    TradeItemID: { type: DataTypes.INTEGER, allowNull: false },
    Status: { type: DataTypes.STRING, allowNull: false },
    ErrorMessage: { type: DataTypes.TEXT, allowNull: true }
  });

  Validations.associate = (models) => {
    Validations.belongsTo(models.TradeItem, { foreignKey: "TradeItemID" });
  };

  return Validations;
};
