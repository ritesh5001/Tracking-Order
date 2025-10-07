const express = require("express");
const router = express.Router();
const Shipment = require("../models/Shipment");
const verifyAdmin = require("../middleware/authMiddleware");

// quick ping for debugging route mounting
router.get('/ping', (req, res) => res.json({ ok: true, route: '/api/admin/ping' }));

router.post("/create-shipment", verifyAdmin, async (req, res) => {
  try {
    console.log('adminRoutes: create-shipment called, body=', req.body);
    const newShipment = new Shipment(req.body);
    await newShipment.save();
    res.status(201).json({ message: "Shipment created successfully", shipment: newShipment });
  } catch (error) {
    console.error("Error creating shipment:", error);
    res.status(500).json({ message: "Failed to create shipment" });
  }
});

router.put("/update-shipment/:trackingId", verifyAdmin, async (req, res) =>{
  try {
    const updatedShipment = await Shipment.findOneAndUpdate(
      { trackingId: req.params.trackingId },
      req.body,
      { new: true }
    );

    if (!updatedShipment)
      return res.status(404).json({ message: "Shipment not found" });

    res.json({ message: "Shipment updated successfully", updatedShipment });
  } catch (error) {
    console.error("Error updating shipment:", error);
    res.status(500).json({ message: "Failed to update shipment" });
  }
});

module.exports = router;