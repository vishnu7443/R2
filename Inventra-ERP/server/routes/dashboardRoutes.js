const express = require("express");

const router = express.Router();

const {
  getDashboardSummary,
  getRevenueAnalytics,
  getSalesChart,
  getPurchaseChart,
  getInventoryStatus,
  getLowStockProducts,
  getRecentSales,
  getRecentPurchases,
} = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");

// ======================================
// Dashboard Summary
// ======================================
router.get(
  "/summary",
  authMiddleware,
  getDashboardSummary
);

// ======================================
// Revenue Analytics
// ======================================
router.get(
  "/revenue",
  authMiddleware,
  getRevenueAnalytics
);

// ======================================
// Sales Chart
// ======================================
router.get(
  "/sales-chart",
  authMiddleware,
  getSalesChart
);

// ======================================
// Purchase Chart
// ======================================
router.get(
  "/purchase-chart",
  authMiddleware,
  getPurchaseChart
);

// ======================================
// Inventory Status
// ======================================
router.get(
  "/inventory-status",
  authMiddleware,
  getInventoryStatus
);

// ======================================
// Low Stock Products
// ======================================
router.get(
  "/low-stock",
  authMiddleware,
  getLowStockProducts
);

// ======================================
// Recent Sales
// ======================================
router.get(
  "/recent-sales",
  authMiddleware,
  getRecentSales
);

// ======================================
// Recent Purchases
// ======================================
router.get(
  "/recent-purchases",
  authMiddleware,
  getRecentPurchases
);

module.exports = router;