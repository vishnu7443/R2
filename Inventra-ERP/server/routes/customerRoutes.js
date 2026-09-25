const express = require("express");

const router = express.Router();

const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ==============================
// CREATE CUSTOMER
// ==============================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER"),
  createCustomer
);

// ==============================
// GET ALL CUSTOMERS
// ==============================

router.get(
  "/",
  authMiddleware,
  getCustomers
);

// ==============================
// GET CUSTOMER BY ID
// ==============================

router.get(
  "/:id",
  authMiddleware,
  getCustomerById
);

// ==============================
// UPDATE CUSTOMER
// ==============================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER"),
  updateCustomer
);

// ==============================
// DELETE CUSTOMER
// ==============================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  deleteCustomer
);

module.exports = router;