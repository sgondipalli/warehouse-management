const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "stock-level-service",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();
let isProducerConnected = false;

const connectProducer = async () => {
  if (!isProducerConnected) {
    await producer.connect();
    isProducerConnected = true;
  }
};

const publishEvent = async (eventType, payload) => {
  await connectProducer();
  await producer.send({
    topic: "stock-level-events",
    messages: [
      {
        key: eventType,
        value: JSON.stringify({ eventType, payload, timestamp: new Date() }),
      },
    ],
  });
};

const publishStockCreated = async (stock) => {
  await publishEvent("STOCK_LEVEL_CREATED", {
    StockLevelID: stock.StockLevelID,
    StorageBinID: stock.StorageBinID,
    Quantity: stock.Quantity,
  });
};

const publishStockUpdated = async (stock, previousQuantity) => {
  await publishEvent("STOCK_LEVEL_UPDATED", {
    StockLevelID: stock.StockLevelID,
    StorageBinID: stock.StorageBinID,
    previousQuantity,
    newQuantity: stock.Quantity,
  });
};

const publishStockDeleted = async (stock) => {
  await publishEvent("STOCK_LEVEL_DELETED", {
    StockLevelID: stock.StockLevelID,
    StorageBinID: stock.StorageBinID,
    Quantity: stock.Quantity,
  });
};

module.exports = {
  publishStockCreated,
  publishStockUpdated,
  publishStockDeleted,
};
