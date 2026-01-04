const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const adminRoutes = require("./routes/adminRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");

const app = express();

// If requests come through a proxy (common in production and sometimes in dev),
// enable trust proxy so middleware like express-rate-limit can read client IPs safely.
app.set('trust proxy', 1);

// ✅ Middleware
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));
app.use(compression());
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

// Basic rate limits (tweak as needed)
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 1000 });
app.use('/api/auth', authLimiter);
app.use('/api/', apiLimiter);

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

// ✅ Serve frontend in production
const FRONTEND_BUILD = path.join(__dirname, '..', 'Frontend', 'admin-dashboard', 'build');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(FRONTEND_BUILD));
}

// ✅ SPA fallback for non-API routes in production (Express 5 compatible)
// Note: Express 5 no longer supports '*' string patterns with path-to-regexp v6.
// Use a regex to match any path that does NOT start with /api/
if (process.env.NODE_ENV === 'production') {
  app.get(/^\/(?!api\/).*/, (req, res, next) => {
    return res.sendFile(path.join(FRONTEND_BUILD, 'index.html'));
  });
}

// Catch-all 404 handler (JSON)
app.use((req, res) => res.status(404).json({ error: 'Not Found', path: req.originalUrl }));

// ✅ Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

app.get("/ping", (req, res) => {
  res.status(200).json({ message: "✅ Server is alive!" });
});
