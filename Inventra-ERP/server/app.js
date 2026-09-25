require("dotenv/config");

const express = require("express");
const cors = require("cors");

const app = express();


// ==============================
// Middleware
// ==============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================
// Vector AI Chaos & Outage Management System
// ==============================
let isServiceCrashed = false;
let crashReason = "THREAD_POOL_SATURATION_AND_MEMORY_DEADLOCK";
let crashTimestamp = null;

// Chaos crash trigger
app.post("/api/chaos/crash", (req, res) => {
  isServiceCrashed = true;
  crashReason = req.body?.reason || "THREAD_POOL_SATURATION_AND_MEMORY_DEADLOCK";
  crashTimestamp = new Date();
  console.log(`\n[CRITICAL FAILURE] 🚨 Inventra ERP Backend crashed by Chaos Injection: ${crashReason}`);
  res.status(200).json({
    crashed: true,
    status: "CRASHED",
    reason: crashReason,
    timestamp: crashTimestamp
  });
});

// Chaos recover trigger (called by Vector AI Remediation)
app.post("/api/chaos/recover", (req, res) => {
  isServiceCrashed = false;
  console.log(`\n[RECOVERY SUCCESS] 🛡️ Inventra ERP Backend restored to nominal state by Vector AI SRE.`);
  res.status(200).json({
    crashed: false,
    status: "HEALTHY",
    recoveredBy: "Vector AI Autonomous SRE",
    timestamp: new Date()
  });
});

// Live Health Check endpoint
app.get("/api/health", (req, res) => {
  if (isServiceCrashed) {
    return res.status(503).json({
      status: "CRITICAL_OUTAGE",
      statusCode: 503,
      error: "Service Unavailable",
      reason: crashReason,
      timestamp: crashTimestamp
    });
  }
  res.status(200).json({
    status: "HEALTHY",
    statusCode: 200,
    service: "Inventra ERP Core API",
    uptime: process.uptime()
  });
});

// Interceptor middleware: When crashed, reject all regular routes with HTTP 503
app.use((req, res, next) => {
  if (isServiceCrashed && !req.path.startsWith("/api/chaos")) {
    return res.status(503).json({
      success: false,
      statusCode: 503,
      error: "HTTP 503 SERVICE UNAVAILABLE",
      message: `🚨 Critical Outage on Inventra ERP: ${crashReason}. Backend thread pool saturated.`,
      sreGuard: "Vector AI Autonomous SRE is currently investigating and executing recovery."
    });
  }
  next();
});

// ==============================
// Routes
// ==============================

// Authentication
const authRoutes = require("./routes/authRoutes");

// Protected Test Route
const testRoutes = require("./routes/testRoutes");

// Category
const categoryRoutes = require("./routes/categoryRoutes");

// Product
const productRoutes = require("./routes/productRoutes");

// Supplier
const supplierRoutes = require("./routes/supplierRoutes");

// Customer
const customerRoutes = require("./routes/customerRoutes");

// Inventory
const inventoryRoutes = require("./routes/inventoryRoutes");

// Purchase
const purchaseRoutes = require("./routes/purchaseRoutes");

// Sales
const saleRoutes = require("./routes/saleRoutes");

// Dashboard (Phase 8)
const dashboardRoutes = require("./routes/dashboardRoutes");

// ==============================
// API Routes
// ==============================

app.use("/api/auth", authRoutes);

app.use("/api/test", testRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/products", productRoutes);

app.use("/api/suppliers", supplierRoutes);

app.use("/api/customers", customerRoutes);

app.use("/api/inventory", inventoryRoutes);

app.use("/api/purchases", purchaseRoutes);

app.use("/api/sales", saleRoutes);

app.use("/api/dashboard", dashboardRoutes);

// ==============================
// Default Route
// ==============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Welcome to Inventra ERP API",
    version: "1.0.0",
  });
});

// ==============================
// 404 Route
// ==============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// ==============================
// Export App
// ==============================

module.exports = app;