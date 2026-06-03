const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/auth");
const vehicleRoutes = require("./routes/vehicles");
const bookingRoutes = require("./routes/bookings");
const userRoutes = require("./routes/users");
const agencyRoutes = require("./routes/agencies");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

/* ── Middleware ── */
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5176",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5177",
    ],
    credentials: true,
  }),
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

app.get("/", (req, res) => {
  res.send("Backend is running 🎉");
});
/* ── Routes ── */
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/agencies", agencyRoutes);

/* ── Health Check ── */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "DriveEase API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

/* ── 404 ── */
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route ${req.originalUrl} not found` });
});

/* ── Error Handler ── */
app.use(errorHandler);

/* ── Connect DB & Start ── */
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`🚀 DriveEase API running on http://localhost:${port}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️  Port ${port} in use — trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('❌ Server error:', err.message);
      process.exit(1);
    }
  });
};

const PORT = parseInt(process.env.PORT, 10) || 3001;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    startServer(PORT);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
