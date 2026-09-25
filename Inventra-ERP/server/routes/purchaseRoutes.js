const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
} = require("../controllers/purchaseController");

// Create Purchase
router.post("/", authMiddleware, createPurchase);

// Get All Purchases
router.get("/", authMiddleware, getPurchases);

// Get Purchase By ID
router.get("/:id", authMiddleware, getPurchaseById);

// Update Purchase
router.put("/:id", authMiddleware, updatePurchase);

// Delete Purchase
router.delete("/:id", authMiddleware, deletePurchase);

module.exports = router;