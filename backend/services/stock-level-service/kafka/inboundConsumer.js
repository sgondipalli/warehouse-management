'use strict';
const { Kafka } = require("kafkajs");
const { StockLevels } = require("../../../common/db/models");
const logger = require("../../../common/utils/logger");

const kafka = new Kafka({
  clientId: "stock-level-service-consumer",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "stock-level-group" });

const startConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: "inbound-events", fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const parsed = JSON.parse(message.value.toString());
          const { eventType, payload } = parsed;

          logger.info(`📩 Received Kafka Message: ${eventType}`);

          if (eventType === "INBOUND_CREATED") {
            const { TradeItemID, StorageBinID, ReceivedQuantity, LocationID } = payload;

            if (!TradeItemID || !StorageBinID || !ReceivedQuantity || !LocationID) {
              logger.warn("⚠️ Missing fields in INBOUND_CREATED payload");
              return;
            }

            const existing = await StockLevels.findOne({ where: { TradeItemID, StorageBinID } });

            if (existing) {
              existing.Quantity += ReceivedQuantity;
              existing.LastUpdated = new Date();
              await existing.save();
              logger.info(`🔁 Updated Stock Level ID ${existing.StockLevelID}`);
            } else {
              const newStock = await StockLevels.create({
                TradeItemID,
                StorageBinID,
                LocationID,
                Quantity: ReceivedQuantity,
                LastUpdated: new Date(),
              });
              logger.info(`🆕 Created New Stock Level ID ${newStock.StockLevelID}`);
            }
          }

          else if (eventType === "INBOUND_UPDATED") {
            const { old, new: updated } = payload;

            if (!old || !updated) {
              logger.warn("⚠️ Missing 'old' or 'new' data in INBOUND_UPDATED payload");
              return;
            }

            // Reverse quantity from old stock
            const oldStock = await StockLevels.findOne({
              where: { TradeItemID: old.TradeItemID, StorageBinID: old.StorageBinID },
            });

            if (oldStock) {
              oldStock.Quantity -= old.ReceivedQuantity;
              oldStock.LastUpdated = new Date();
              await oldStock.save();
              logger.info(`↩️ Reversed old quantity from StockLevelID ${oldStock.StockLevelID}`);
            }

            // Apply new quantity to updated stock
            const newStock = await StockLevels.findOne({
              where: { TradeItemID: updated.TradeItemID, StorageBinID: updated.StorageBinID },
            });

            if (newStock) {
              newStock.Quantity += updated.ReceivedQuantity;
              newStock.LastUpdated = new Date();
              await newStock.save();
              logger.info(`🔁 Updated Stock Level with new data StockLevelID ${newStock.StockLevelID}`);
            } else {
              if (!updated.LocationID) {
                logger.warn("⚠️ LocationID missing in updated payload: ", updated);
                return;
              }

              const created = await StockLevels.create({
                TradeItemID: updated.TradeItemID,
                StorageBinID: updated.StorageBinID,
                LocationID: updated.LocationID,
                Quantity: updated.ReceivedQuantity,
                LastUpdated: new Date(),
              });
              logger.info(`🆕 Created new stock from update StockLevelID ${created.StockLevelID}`);
            }
          }

          else if (eventType === "INBOUND_DELETED") {
            const { TradeItemID, StorageBinID, ReceivedQuantity } = payload;

            if (!TradeItemID || !StorageBinID || !ReceivedQuantity) {
              logger.warn("⚠️ Missing fields in INBOUND_DELETED payload");
              return;
            }

            const stock = await StockLevels.findOne({ where: { TradeItemID, StorageBinID } });

            if (stock) {
              stock.Quantity -= ReceivedQuantity;
              stock.LastUpdated = new Date();
              await stock.save();
              logger.info(`🗑️ Deducted quantity due to INBOUND_DELETED. StockLevelID ${stock.StockLevelID}`);
            } else {
              logger.warn("⚠️ No stock found to deduct on delete event");
            }
          }

        } catch (err) {
          logger.error("💥 Error processing Kafka message", err);
        }
      }
    });

    logger.info("🚀 Kafka consumer for inbound-events is running...");
  } catch (err) {
    logger.error("❌ Kafka consumer connection error", err);
  }
};

module.exports = { startConsumer };
