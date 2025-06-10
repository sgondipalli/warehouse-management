'use strict';
module.exports = (sequelize, DataTypes) => {
  const OutboundDispatch = sequelize.define("OutboundDispatch", {
    DispatchID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    OrderItemID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "OrderItems",
        key: "OrderItemID",
      },
    },
    SourceWarehouseID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    DestinationWarehouseID: {
      type: DataTypes.INTEGER,
      allowNull: true, // Optional for customer delivery
    },
    DispatchDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    DeliveryAgentID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
    VehicleID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Vehicles",
        key: "VehicleID",
      },
    },
    Status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Dispatched",
      validate: {
        isIn: [["Dispatched", "Delivered", "In Transit", "Cancelled"]],
      },
    },
    Remarks: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    AssignedLocationID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "LocationMaster",
        key: "LocationID",
      },
    },
    IsFinalLeg: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    ParentDispatchID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "OutboundDispatches",
        key: "DispatchID",
      },
    },
    CustomerName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    CustomerAddress: {
      type: DataTypes.TEXT, // longer field for full addresses
      allowNull: true,
    },
  }, {
    tableName: "OutboundDispatches",
    timestamps: true,
  });

  OutboundDispatch.associate = (models) => {
    OutboundDispatch.belongsTo(models.OrderItem, {
      foreignKey: "OrderItemID",
      as: "OrderItem",
    });
    OutboundDispatch.belongsTo(models.Users, {
      foreignKey: "DeliveryAgentID",
      as: "DeliveryAgent",
    });
    OutboundDispatch.belongsTo(models.Vehicle, {
      foreignKey: "VehicleID",
      as: "Vehicle",
    });
    OutboundDispatch.belongsTo(models.OutboundDispatch, {
      foreignKey: "ParentDispatchID",
      as: "ParentDispatch",
    });
    OutboundDispatch.belongsTo(models.LocationMaster, {
      foreignKey: "AssignedLocationID",
      as: "AssignedLocation",
    });
  };

  return OutboundDispatch;
};
