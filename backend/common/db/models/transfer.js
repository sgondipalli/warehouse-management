// model/transfer.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Transfer = sequelize.define("Transfer", {
    TransferID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    SourceWarehouseID: { type: DataTypes.INTEGER, allowNull: false },
    DestinationWarehouseID: { type: DataTypes.INTEGER, allowNull: false },
    Status: { type: DataTypes.STRING, allowNull: false, defaultValue: "IN_TRANSIT" },
    Remarks: { type: DataTypes.STRING, allowNull: true },
    InitiatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { tableName: "Transfers", timestamps: true });

  Transfer.associate = (models) => {
    Transfer.belongsTo(models.LocationMaster, { foreignKey: 'SourceWarehouseID', as: 'SourceWarehouse' });
    Transfer.belongsTo(models.LocationMaster, { foreignKey: 'DestinationWarehouseID', as: 'DestinationWarehouse' });
  };

  return Transfer;
};
