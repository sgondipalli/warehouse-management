'use strict';
module.exports = (sequelize, DataTypes) => {
  const Vehicle = sequelize.define("Vehicle", {
    VehicleID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    VehicleNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    VehicleType: { type: DataTypes.STRING, allowNull: false }, 
    DriverName: { type: DataTypes.STRING, allowNull: false },
    ContactNumber: { type: DataTypes.STRING, allowNull: false },
    Capacity: { type: DataTypes.INTEGER, allowNull: true },
    Status: { type: DataTypes.STRING, defaultValue: "AVAILABLE" }
  }, {
    tableName: "Vehicles",
    timestamps: true
  });

  return Vehicle;
};
