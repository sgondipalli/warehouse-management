// kafka/inboundProducer.js
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "inbound-service",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();
const topic = "inbound-events";

let isConnected = false;

const connectProducer = async () => {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
    console.log("✅ Kafka producer connected (Inbound)");
  }
};

// Generic function to publish any event
const publishInboundEvent = async (eventType, payload) => {
  await connectProducer();
  await producer.send({
    topic,
    messages: [
      {
        key: eventType,
        value: JSON.stringify({
          eventType,
          payload,
          timestamp: new Date().toISOString()
        }),
      },
    ],
  });
};

// Event-specific wrappers
const publishInboundCreated = async (inbound) => {
  await publishInboundEvent("INBOUND_CREATED", inbound);
};

const publishInboundUpdated = async (inbound) => {
  await publishInboundEvent("INBOUND_UPDATED", inbound);
};

const publishInboundDeleted = async (inbound) => {
  await publishInboundEvent("INBOUND_DELETED",  inbound);
};

// Optional: graceful shutdown
process.on("SIGINT", async () => {
  if (isConnected) {
    await producer.disconnect();
    console.log("🛑 Kafka producer disconnected");
  }
  process.exit(0);
});

module.exports = {
  publishInboundCreated,
  publishInboundUpdated,
  publishInboundDeleted,
};
