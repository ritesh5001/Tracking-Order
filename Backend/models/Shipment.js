const mongoose = require("mongoose");

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

module.exports = mongoose.model("Shipment", shipmentSchema);