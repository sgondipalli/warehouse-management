'use strict';

const { Kafka } = require("kafkajs");
const { StockLevels, StorageBin } = require("../../../common/db/models");
const logger = require("../../../common/utils/logger");

const kafka = new Kafka({
  clientId: "stock-level-service-consumer",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "stock-level-group" });

// Validate bin capacity before applying delta
const getBinAndValidate = async (StorageBinID, deltaQty) => {
  const bin = await StorageBin.findByPk(StorageBinID);
  if (!bin) {
    logger.warn(`⚠️ StorageBin not found for BinID ${StorageBinID}`);
    return { bin: null, canProceed: false };
  }

  const projected = bin.CurrentStock + deltaQty;
  if (deltaQty > 0 && projected > bin.MaxCapacity) {
    logger.warn(`❌ Capacity exceeded for BinID ${StorageBinID}: Current=${bin.CurrentStock}, Incoming=${deltaQty}, Max=${bin.MaxCapacity}`);
    return { bin, canProceed: false };
  }

  return { bin, canProceed: true };
};

// Apply bin stock adjustment
const adjustBinStock = async (bin, deltaQty) => {
  bin.CurrentStock += deltaQty;
  await bin.save();
  logger.info(`📦 BinID ${bin.BinID} adjusted by ${deltaQty}, new stock: ${bin.CurrentStock}`);
};

// Kafka Consumer Logic
const startConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: "inbound-events", fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const parsed = JSON.parse(message.value.toString());
          const { eventType, payload } = parsed;

          logger.info(`📩 Received Kafka Event: ${eventType}`);

          if (eventType === "INBOUND_CREATED") {
            const { TradeItemID, StorageBinID, ReceivedQuantity, LocationID } = payload;
            if (!TradeItemID || !StorageBinID || !ReceivedQuantity || !LocationID) return;

            const { bin, canProceed } = await getBinAndValidate(StorageBinID, +ReceivedQuantity);
            if (!canProceed) return;

            const existing = await StockLevels.findOne({ where: { TradeItemID, StorageBinID } });

            if (existing) {
              existing.Quantity += +ReceivedQuantity;
              existing.LastUpdated = new Date();
              await existing.save();
              logger.info(`🔁 Updated StockLevelID ${existing.StockLevelID}`);
            } else {
              const newStock = await StockLevels.create({
                TradeItemID,
                StorageBinID,
                LocationID,
                Quantity: +ReceivedQuantity,
                LastUpdated: new Date(),
              });
              logger.info(`🆕 Created StockLevelID ${newStock.StockLevelID}`);
            }

            await adjustBinStock(bin, +ReceivedQuantity);
          }

          else if (eventType === "INBOUND_UPDATED") {
            const { old, new: updated } = payload;
            if (!old || !updated) return;

            const deltaRemove = -old.ReceivedQuantity;
            const deltaAdd = +updated.ReceivedQuantity;

            // Reverse old stock
            const oldStock = await StockLevels.findOne({
              where: { TradeItemID: old.TradeItemID, StorageBinID: old.StorageBinID }
            });
            if (oldStock) {
              oldStock.Quantity += deltaRemove;
              oldStock.LastUpdated = new Date();
              await oldStock.save();
              logger.info(`↩️ Reversed old stock from StockLevelID ${oldStock.StockLevelID}`);
            }

            const oldBin = await StorageBin.findByPk(old.StorageBinID);
            if (oldBin) await adjustBinStock(oldBin, deltaRemove);

            // Add new stock
            const { bin: newBin, canProceed } = await getBinAndValidate(updated.StorageBinID, deltaAdd);
            if (!canProceed) return;

            const newStock = await StockLevels.findOne({
              where: { TradeItemID: updated.TradeItemID, StorageBinID: updated.StorageBinID }
            });

            if (newStock) {
              newStock.Quantity += deltaAdd;
              newStock.LastUpdated = new Date();
              await newStock.save();
              logger.info(`🔁 Updated StockLevelID ${newStock.StockLevelID}`);
            } else {
              if (!updated.LocationID) {
                logger.warn("⚠️ Missing LocationID for new update stock");
                return;
              }
              const created = await StockLevels.create({
                TradeItemID: updated.TradeItemID,
                StorageBinID: updated.StorageBinID,
                LocationID: updated.LocationID,
                Quantity: deltaAdd,
                LastUpdated: new Date(),
              });
              logger.info(`🆕 Created new stock from update StockLevelID ${created.StockLevelID}`);
            }

            await adjustBinStock(newBin, deltaAdd);
          }

          else if (eventType === "INBOUND_DELETED") {
            const { TradeItemID, StorageBinID, ReceivedQuantity } = payload;
            if (!TradeItemID || !StorageBinID || !ReceivedQuantity) return;

            const stock = await StockLevels.findOne({ where: { TradeItemID, StorageBinID } });
            if (stock) {
              stock.Quantity -= +ReceivedQuantity;
              stock.LastUpdated = new Date();
              await stock.save();
              logger.info(`🗑️ Deducted stock for delete. StockLevelID ${stock.StockLevelID}`);
            }

            const bin = await StorageBin.findByPk(StorageBinID);
            if (bin) await adjustBinStock(bin, -ReceivedQuantity);
          }

        } catch (err) {
          logger.error("💥 Kafka processing error", err);
        }
      }
    });

    logger.info("🚀 Kafka consumer is now listening on 'inbound-events'");
  } catch (err) {
    logger.error("❌ Kafka consumer connection error", err);
  }
};

module.exports = { startConsumer };
