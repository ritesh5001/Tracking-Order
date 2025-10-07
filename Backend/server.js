const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const adminRoutes = require("./routes/adminRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// Simple request logger for debugging (prints every incoming request)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Routes
app.use("/api/admin", adminRoutes);
app.use("/api/shipment", shipmentRoutes);

// ✅ Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err.message));

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("🚀 Shipment Tracking Backend is Running");
});

// Catch-all 404 handler (returns JSON instead of Express HTML)
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

// ✅ Server Listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});