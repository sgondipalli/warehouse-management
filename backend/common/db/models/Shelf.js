'use strict';
module.exports = (sequelize, DataTypes) => {
  const Shelf = sequelize.define("Shelf", {
    ShelfID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    RackID: { type: DataTypes.INTEGER, allowNull: false },
    ShelfNumber: { type: DataTypes.STRING, allowNull: false },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    deletedAt: { type: DataTypes.DATE, allowNull: true }
  }, {
    sequelize,
    tableName: "Shelves",
    timestamps: true,
    paranoid: true
  });

  Shelf.associate = (models) => {
    Shelf.belongsTo(models.Rack, { foreignKey: "RackID" });
    Shelf.hasMany(models.StorageBin, { foreignKey: "ShelfID", as: "StorageBins" });
  };

  return Shelf;
};
