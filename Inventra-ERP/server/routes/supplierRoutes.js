const express = require("express");
const router = express.Router();

const {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Create Supplier
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER"),
  createSupplier
);

// Get All Suppliers
router.get("/", authMiddleware, getSuppliers);

// Get Supplier By ID
router.get("/:id", authMiddleware, getSupplierById);

// Update Supplier
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER"),
  updateSupplier
);

// Delete Supplier
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  deleteSupplier
);

module.exports = router;