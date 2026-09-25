const express = require("express");
const router = express.Router();

const {
  stockIn,
  stockOut,
  adjustStock,
  getHistory,
  lowStock,
} = require("../controllers/inventoryController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Stock In
router.post(
  "/stock-in",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER"),
  stockIn
);

// Stock Out
router.post(
  "/stock-out",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER"),
  stockOut
);

// Stock Adjustment
router.post(
  "/adjust",
  authMiddleware,
  roleMiddleware("ADMIN"),
  adjustStock
);

// Transaction History
router.get(
  "/history",
  authMiddleware,
  getHistory
);

// Low Stock
router.get(
  "/low-stock",
  authMiddleware,
  lowStock
);

module.exports = router;