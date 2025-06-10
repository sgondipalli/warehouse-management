'use strict';

const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "outbound-service",
  brokers: ["localhost:9092"], // Update as per environment
});

const producer = kafka.producer();
let isConnected = false;

const connectProducer = async () => {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
    console.log("✅ Kafka producer connected (Outbound Service)");
  }
};

// Generic event publisher
const publishOutboundEvent = async (eventType, payload) => {
  await connectProducer();
  await producer.send({
    topic: "outbound-events",
    messages: [
      {
        key: eventType,
        value: JSON.stringify({
          eventType,
          payload,
          timestamp: new Date().toISOString(),
        }),
      },
    ],
  });
  console.log(`📤 Event Published: ${eventType}`);
};

// Publish when dispatch is created
const publishOutboundDispatched = async (dispatchPayload) => {
  const {
    DispatchID,
    OrderItemID,
    VehicleID,
    DeliveryAgentID,
    SourceWarehouseID,
    DestinationWarehouseID,
    AssignedLocationID,
    Remarks,
    DispatchDate,
    IsFinalLeg,
    ParentDispatchID,
    CustomerName,
    CustomerAddress
  } = dispatchPayload;

  const payload = {
    DispatchID,
    OrderItemID,
    VehicleID,
    DeliveryAgentID,
    SourceWarehouseID,
    DestinationWarehouseID,
    AssignedLocationID,
    Remarks,
    DispatchDate: DispatchDate || new Date().toISOString(),
    IsFinalLeg,
    ParentDispatchID,
    CustomerName,
    CustomerAddress,
  };

  await publishOutboundEvent("OUTBOUND_DISPATCHED", payload);
};

// Graceful shutdown
process.on("SIGINT", async () => {
  if (isConnected) {
    await producer.disconnect();
    console.log("🔌 Kafka producer disconnected (Outbound)");
  }
  process.exit(0);
});

module.exports = {
  publishOutboundDispatched,
  publishOutboundEvent, // export in case other events are needed later
};
