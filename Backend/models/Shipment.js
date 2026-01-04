const mongoose = require("mongoose");

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

const shipmentSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    required: true,
    unique: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
    required: true,
  },
  currentLocation: {
    type: String,
    default: "Warehouse",
  },
  status: {
    type: String,
    enum: [
      "Pending",
      "Dispatched",
      "In Transit",
      "Out for Delivery", 
      "Delivered",
      "Failed",           
      "Returned"          
    ],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  estimatedDelivery: {
    type: Date,
  },
});

// Auto-delete shipments older than 30 days.
// Note: TTL cleanup is handled by MongoDB in the background (not immediate).
shipmentSchema.index({ createdAt: 1 }, { expireAfterSeconds: THIRTY_DAYS_SECONDS });

module.exports = mongoose.model("Shipment", shipmentSchema);