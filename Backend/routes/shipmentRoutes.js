const express = require("express");
const router = express.Router();
const Shipment = require("../models/Shipment");

// GET /api/shipment/:trackingId
// Find by trackingId only (MongoDB _id lookup removed)
router.get("/:trackingId", async (req, res) => {
  const trackingId = req.params.trackingId;
  try {
    const shipment = await Shipment.findOne({ trackingId });
    if (!shipment) return res.status(404).json({ message: "Shipment not found" });
    res.json(shipment);
  } catch (error) {
    console.error("Error fetching shipment:", error);
    res.status(500).json({ message: "Failed to fetch shipment" });
  }
});

// GET /api/shipment/by-phone/:phone
// Return all shipments associated with a customer phone number
router.get("/by-phone/:phone", async (req, res) => {
  const phone = req.params.phone;
  try {
    const shipments = await Shipment.find({ customerPhone: phone }).sort({ createdAt: -1 });
    if (!shipments || shipments.length === 0) {
      return res.status(404).json({ message: "No shipments found for this phone number" });
    }
    res.json({ count: shipments.length, shipments });
  } catch (error) {
    console.error("Error fetching shipments by phone:", error);
    res.status(500).json({ message: "Failed to fetch shipments by phone" });
  }
});

module.exports = router;