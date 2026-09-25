const express = require("express");

const router = express.Router();

const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Create Category
router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "MANAGER"),
  createCategory
);

// Get All Categories
router.get("/", authenticateToken, getCategories);

// Get Category By ID
router.get("/:id", authenticateToken, getCategoryById);

// Update Category
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "MANAGER"),
  updateCategory
);

// Delete Category
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  deleteCategory
);

module.exports = router;