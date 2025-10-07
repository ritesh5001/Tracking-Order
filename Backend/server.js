const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const adminRoutes = require("./routes/adminRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");

const app = express();

// ✅ Middleware
// CORS: allow configured frontend origin(s) in production, default to permissive for development
const allowedOrigins = process.env.FRONTEND_ORIGIN
  ? process.env.FRONTEND_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
  : true; // reflect request origin (permissive)

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// Simple request logger for debugging (prints every incoming request)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Routes
app.use("/api/admin", adminRoutes);
app.use("/api/shipment", shipmentRoutes);
app.use("/api/auth", authRoutes);

// Lightweight health endpoint for uptime checks
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

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