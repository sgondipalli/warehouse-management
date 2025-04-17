// models/supplier.js
module.exports = (sequelize, DataTypes) => {
    const Supplier = sequelize.define("Supplier", {
      SupplierID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      SupplierName: { type: DataTypes.STRING, allowNull: false },
      ContactEmail: { type: DataTypes.STRING },
      PhoneNumber: { type: DataTypes.STRING, allowNull: true },
      Address: { type: DataTypes.TEXT },
      isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      deletedAt: { type: DataTypes.DATE }
    }, {
      tableName: "Suppliers",
      timestamps: true,
      paranoid: true,
    });
  
    return Supplier;
  };
  