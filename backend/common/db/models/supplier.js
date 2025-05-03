module.exports = (sequelize, DataTypes) => {
  const Supplier = sequelize.define("Supplier", {
    SupplierID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    SupplierName: { type: DataTypes.STRING, allowNull: false },
    ContactEmail: { type: DataTypes.STRING },
    PhoneNumber: { type: DataTypes.STRING },
    Address: { type: DataTypes.TEXT },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    deletedAt: { type: DataTypes.DATE },
    CreatedByUserID: { type: DataTypes.INTEGER, allowNull: true },
    UpdatedByUserID: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    tableName: "Suppliers",
    timestamps: true,
    paranoid: true,
  });

  // Associate with TradeItemSupplier
  Supplier.associate = (models) => {
    Supplier.hasMany(models.TradeItemSupplier, {
      foreignKey: "SupplierID",
      onDelete: "CASCADE",
    });
  };

  return Supplier;
};
