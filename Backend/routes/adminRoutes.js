const express = require("express");
const router = express.Router();
const Shipment = require("../models/Shipment");
const verifyAdmin = require("../middleware/authMiddleware");

// quick ping for debugging route mounting
router.get('/ping', (req, res) => res.json({ ok: true, route: '/api/admin/ping' }));

router.post("/create-shipment", verifyAdmin, async (req, res) => {
  try {
    console.log('adminRoutes: create-shipment called, body=', req.body);
    const body = { ...req.body };
    if (body.customerPhone) {
      body.customerPhone = String(body.customerPhone).replace(/\D/g, '');
    }
    const newShipment = new Shipment(body);
    await newShipment.save();
    res.status(201).json({ message: "Shipment created successfully", shipment: newShipment });
  } catch (error) {
    console.error("Error creating shipment:", error);
    res.status(500).json({ message: "Failed to create shipment" });
  }
});

router.put("/update-shipment/:trackingId", verifyAdmin, async (req, res) =>{
  try {
    const patch = { ...req.body };
    if (patch.customerPhone) {
      patch.customerPhone = String(patch.customerPhone).replace(/\D/g, '');
    }
    const updatedShipment = await Shipment.findOneAndUpdate(
      { trackingId: req.params.trackingId },
      patch,
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

// GET /api/admin/recent-shipments?days=5
// Returns shipments created within the last `days` days (default 5), newest first.
router.get('/recent-shipments', verifyAdmin, async (req, res) => {
  try {
    const maxDays = 30;
    let days = parseInt(req.query.days, 10);
    if (Number.isNaN(days) || days <= 0) days = 5;
    days = Math.min(days, maxDays);

    const since = new Date();
    since.setDate(since.getDate() - days);

    const limit = Math.min(parseInt(req.query.limit, 10) || 200, 1000);

    const shipments = await Shipment.find({ createdAt: { $gte: since } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      days,
      from: since.toISOString(),
      count: shipments.length,
      shipments,
    });
  } catch (error) {
    console.error('Error fetching recent shipments:', error);
    res.status(500).json({ message: 'Failed to fetch recent shipments' });
  }
});

module.exports = router;