'use strict';
module.exports = (sequelize, DataTypes) => {
  const TradeItemSupplier = sequelize.define("TradeItemSupplier", {
    TradeItemSupplierID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    TradeItemID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'TradeItems', key: 'TradeItemID' },
      onDelete: 'CASCADE'
    },
    SupplierID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Suppliers', key: 'SupplierID' },
      onDelete: 'CASCADE'
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: "TradeItemSuppliers",
    timestamps: true,
  });

  // Associate with TradeItem and Supplier
  TradeItemSupplier.associate = (models) => {
    TradeItemSupplier.belongsTo(models.TradeItem, {
      foreignKey: "TradeItemID",
      onDelete: "CASCADE",
    });

    TradeItemSupplier.belongsTo(models.Supplier, {
      foreignKey: "SupplierID",
      onDelete: "CASCADE",
    });
  };

  return TradeItemSupplier;
};
