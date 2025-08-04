'use strict';

const { Kafka } = require("kafkajs");
const { StockLevels, StorageBin, OrderItem } = require("../../../common/db/models");
const logger = require("../../../common/utils/logger");
const { Op } = require("sequelize");

const kafka = new Kafka({
  clientId: "stock-level-service-consumer",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "stock-level-group-outbound" });

const adjustBinStock = async (StorageBinID, quantity) => {
  const bin = await StorageBin.findByPk(StorageBinID);
  if (!bin) {
    logger.warn(`⚠️ Bin not found for StorageBinID ${StorageBinID}`);
    return;
  }

  bin.CurrentStock = Math.max(0, bin.CurrentStock - quantity);
  await bin.save();
  logger.info(`📦 Bin ${StorageBinID} stock reduced by ${quantity}. New: ${bin.CurrentStock}`);
};

const reduceStockFIFO = async ({ TradeItemID, DispatchedQuantity, LocationID }) => {
  let quantityToDeduct = DispatchedQuantity;

  const stockRecords = await StockLevels.findAll({
    where: {
      TradeItemID,
      LocationID,
      Quantity: { [Op.gt]: 0 }
    },
    order: [['LastUpdated', 'ASC']]
  });

  if (stockRecords.length === 0) {
    logger.warn(`⚠️ No stock found for TradeItemID ${TradeItemID} in LocationID ${LocationID}`);
    return;
  }

  for (const stock of stockRecords) {
    if (quantityToDeduct <= 0) break;

    const deduct = Math.min(stock.Quantity, quantityToDeduct);
    stock.Quantity -= deduct;
    stock.LastUpdated = new Date();
    await stock.save();

    await adjustBinStock(stock.StorageBinID, deduct);

    logger.info(`✅ Deducted ${deduct} from StockLevelID ${stock.StockLevelID} (Bin ${stock.StorageBinID})`);
    quantityToDeduct -= deduct;
  }

  if (quantityToDeduct > 0) {
    logger.warn(`⚠️ Could not fulfill entire dispatch. ${quantityToDeduct} units remain undeducted.`);
  }
};

const startOutboundConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: "outbound-events", fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const { eventType, payload } = JSON.parse(message.value.toString());
          logger.info(`📥 Received Outbound Event: ${eventType}`);

          if (eventType === "OUTBOUND_DISPATCHED") {
            const {
              OrderItemID,
              SourceWarehouseID,
              IsFinalLeg,
              DispatchedQuantity,
              TradeItemID: passedTradeItemID
            } = payload;

            // Fetch TradeItemID and Quantity if not present
            let TradeItemID = passedTradeItemID;
            let quantity = DispatchedQuantity;

            if (!TradeItemID || !quantity) {
              const orderItem = await OrderItem.findByPk(OrderItemID);
              if (!orderItem) {
                logger.warn(`⚠️ OrderItem not found: ${OrderItemID}`);
                return;
              }
              TradeItemID = orderItem.TradeItemID;
              quantity = orderItem.Quantity;
            }

            if (!TradeItemID || !SourceWarehouseID || !quantity) {
              logger.warn("⚠️ Missing critical fields for stock deduction");
              return;
            }

            logger.info(`🔄 Processing dispatch of ${quantity} units of TradeItem ${TradeItemID} from warehouse ${SourceWarehouseID}`);

            await reduceStockFIFO({
              TradeItemID,
              DispatchedQuantity: quantity,
              LocationID: SourceWarehouseID
            });
          }
        } catch (err) {
          logger.error("❌ Error processing outbound message", err);
        }
      }
    });

    logger.info("✅ Kafka Consumer for outbound dispatches started");
  } catch (err) {
    logger.error("❌ Kafka consumer connection error (Outbound)", err);
  }
};

module.exports = { startOutboundConsumer };
