const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const Shipment = require("../models/Shipment");

// GET /api/shipment/:idOrTrackingId
// Try trackingId first, then fall back to ObjectId lookup to avoid Cast errors
router.get("/:idOrTrackingId", async (req, res) => {
  const key = req.params.idOrTrackingId;
  try {
    // Try find by trackingId first
    let shipment = await Shipment.findOne({ trackingId: key });

    // If not found and the param looks like an ObjectId, try by _id
    if (!shipment && mongoose.Types.ObjectId.isValid(key)) {
      shipment = await Shipment.findById(key);
    }

    if (!shipment) return res.status(404).json({ message: "Shipment not found" });

    res.json(shipment);
  } catch (error) {
    console.error("Error fetching shipment:", error);
    res.status(500).json({ message: "Failed to fetch shipment" });
  }
});

module.exports = router;