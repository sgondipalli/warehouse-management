'use strict';
module.exports = (sequelize, DataTypes) => {
  const StockLevels = sequelize.define("StockLevels", {
    StockLevelID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    TradeItemID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'TradeItems',
        key: 'TradeItemID'
      },
      onDelete: 'CASCADE',
    },
    LocationID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'LocationMaster',
        key: 'LocationID'
      },
      onDelete: 'CASCADE',
    },
    StorageBinID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'StorageBins',
        key: 'BinID'  // ✅ fixed: match the actual DB column name
      },
      onDelete: 'SET NULL',
    },
    Quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    LastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'StockLevels',
    timestamps: false,
  });

  StockLevels.associate = (models) => {
    StockLevels.belongsTo(models.TradeItem, {
      foreignKey: 'TradeItemID',
      as: 'TradeItem',
    });
    StockLevels.belongsTo(models.LocationMaster, {
      foreignKey: 'LocationID',
      as: 'Location',
    });
    StockLevels.belongsTo(models.StorageBin, {
      foreignKey: 'StorageBinID',
      as: 'StorageBin',
      targetKey: 'BinID'  
    });
  };

  return StockLevels;
};
