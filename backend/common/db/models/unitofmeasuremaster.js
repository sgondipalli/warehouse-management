'use strict';
module.exports = (sequelize, DataTypes) => {
  const UnitOfMeasureMaster = sequelize.define("UnitOfMeasureMaster", {
    UOMID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    UOMCode: { type: DataTypes.STRING, allowNull: false },
    UOMDescription: { type: DataTypes.STRING, allowNull: true }
  }, {
    timestamps: false,
    tableName: "UnitOfMeasureMaster"
  });
  return UnitOfMeasureMaster;
};