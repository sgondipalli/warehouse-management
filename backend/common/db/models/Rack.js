'use strict';
module.exports = (sequelize, DataTypes) => {
  const Rack = sequelize.define("Rack", {
    RackID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ZoneID: { type: DataTypes.INTEGER, allowNull: false },
    RackNumber: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: "Racks",
    timestamps: false,
  });

  Rack.associate = (models) => {
    Rack.belongsTo(models.Zone, { foreignKey: "ZoneID" });
    Rack.hasMany(models.Shelf, { foreignKey: "RackID" });
    Rack.hasMany(models.StorageBin, { foreignKey: "RackID" });
  };

  return Rack;
};
