'use strict';
module.exports = (sequelize, DataTypes) => {
  const Shelf = sequelize.define("Shelf", {
    ShelfID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    RackID: { type: DataTypes.INTEGER, allowNull: false },
    ShelfNumber: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: "Shelves",
    timestamps: false,
  });

  Shelf.associate = (models) => {
    Shelf.belongsTo(models.Rack, { foreignKey: "RackID" });
    Shelf.hasMany(models.StorageBin, { foreignKey: "ShelfID" });
  };

  return Shelf;
};
