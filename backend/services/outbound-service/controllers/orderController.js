'use strict';
const db = require("../../../common/db/models");

const {
  Sequelize,
  Order,
  OrderItem,
  Users,
  LocationMaster,
  UserLocationAccess,
  AddressTable
} = db;

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const {
      CustomerName,
      CustomerAddress,
      SourceWarehouseID,
      DestinationWarehouseID,
      DeliveryType,
      OrderItems
    } = req.body;

    const userId = req.user?.userId;
    const userRoles = req.user?.roleNames || [];

    if (!SourceWarehouseID || !DestinationWarehouseID || !DeliveryType || !OrderItems?.length) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (DeliveryType === "W2C" && (!CustomerName || !CustomerAddress)) {
      return res.status(400).json({ message: "Customer info required for W2C delivery." });
    }

    if (userRoles.includes("Warehouse Manager")) {
      const access = await UserLocationAccess.findOne({
        where: { UserID: userId, LocationID: SourceWarehouseID }
      });

      if (!access) {
        return res.status(403).json({ message: "Access to the source warehouse is denied." });
      }
    }

    const order = await Order.create({
      CustomerName: DeliveryType === "W2C" ? CustomerName : null,
      CustomerAddress: DeliveryType === "W2C" ? CustomerAddress : null,
      SourceWarehouseID,
      DestinationWarehouseID,
      DeliveryType,
      CreatedByUserID: userId
    });

    const items = await OrderItem.bulkCreate(
      OrderItems.map(item => ({ ...item, OrderID: order.OrderID }))
    );

    res.status(201).json({ message: "Order created", data: { order, items } });
  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
};

// Get all orders with enriched associations
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const userRoles = req.user?.roleNames || [];

    let filter = {};

    if (userRoles.includes("Warehouse Manager") || userRoles.includes("Warehouse Worker")) {
      const accessRecords = await UserLocationAccess.findAll({ where: { UserID: userId } });
      const accessibleLocationIds = accessRecords.map(r => r.LocationID);

      if (accessibleLocationIds.length === 0) {
        return res.status(403).json({ message: "No accessible warehouse locations." });
      }

      filter = {
        [Sequelize.Op.or]: [
          { SourceWarehouseID: accessibleLocationIds },
          { DestinationWarehouseID: accessibleLocationIds }
        ]
      };
    }

    const orders = await Order.findAll({
      where: filter,
      include: [
        { model: OrderItem, as: "Items" },
        { model: Users, as: "CreatedBy", attributes: ["id", "email"] },
        {
          model: LocationMaster,
          as: "SourceWarehouse",
          attributes: ["LocationID", "LocationName"],
          include: [
            {
              model: AddressTable,
              attributes: ["City"]
            }
          ]
        },
        {
          model: LocationMaster,
          as: "DestinationWarehouse",
          attributes: ["LocationID", "LocationName"],
          include: [
            {
              model: AddressTable,
              attributes: ["City"]
            }
          ]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.status(200).json(orders);
  } catch (err) {
    console.error("Get Orders Error:", err);
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
};

// Get single order by ID with associations
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        { model: OrderItem, as: "Items" },
        { model: Users, as: "CreatedBy", attributes: ["id", "email"] },
        {
          model: LocationMaster,
          as: "SourceWarehouse",
          attributes: ["LocationID", "LocationName"],
          include: [
            {
              model: AddressTable,
              attributes: ["City"]
            }
          ]
        },
        {
          model: LocationMaster,
          as: "DestinationWarehouse",
          attributes: ["LocationID", "LocationName"],
          include: [
            {
              model: AddressTable,
              attributes: ["City"]
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error("Get Order By ID Error:", err);
    res.status(500).json({ message: "Failed to retrieve order", error: err.message });
  }
};
