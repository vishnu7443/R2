const express = require("express");

const router = express.Router();

const {
  createSale,
  getAllSales,
  getSaleById,
  updateSaleStatus,
  deleteSale,
} = require("../controllers/saleController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ======================================
// CREATE SALE
// ADMIN + MANAGER
// ======================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER"),
  createSale
);

// ======================================
// GET ALL SALES
// ALL AUTHORIZED USERS
// ======================================

router.get(
  "/",
  authMiddleware,
  getAllSales
);

// ======================================
// GET SALE BY ID
// ALL AUTHORIZED USERS
// ======================================

router.get(
  "/:id",
  authMiddleware,
  getSaleById
);

// ======================================
// UPDATE SALE STATUS
// ADMIN + MANAGER
// ======================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER"),
  updateSaleStatus
);

// ======================================
// DELETE SALE
// ADMIN ONLY
// ======================================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  deleteSale
);

module.exports = router;