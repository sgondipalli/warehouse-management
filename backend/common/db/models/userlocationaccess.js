module.exports = (sequelize, DataTypes) => {
  const UserLocationAccess = sequelize.define(
    'UserLocationAccess',
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      locationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true, // ✅ Add this line
    }
  );

  UserLocationAccess.associate = (models) => {
    UserLocationAccess.belongsTo(models.Users, {
      foreignKey: 'userId',
    });

    UserLocationAccess.belongsTo(models.LocationMaster, {
      foreignKey: 'locationId',
      as: 'Location',
    });
  };

  return UserLocationAccess;
};
