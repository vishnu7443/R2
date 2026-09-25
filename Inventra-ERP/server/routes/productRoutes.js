const express = require("express");

const router = express.Router();

// Controllers
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

// Middleware
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


// ==============================
// CREATE PRODUCT
// ADMIN & MANAGER
// ==============================

router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN", "MANAGER"),
    createProduct
);


// ==============================
// GET ALL PRODUCTS
// ALL LOGGED-IN USERS
// ==============================

router.get(
    "/",
    authMiddleware,
    getProducts
);


// ==============================
// GET PRODUCT BY ID
// ALL LOGGED-IN USERS
// ==============================

router.get(
    "/:id",
    authMiddleware,
    getProductById
);


// ==============================
// UPDATE PRODUCT
// ADMIN & MANAGER
// ==============================

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN", "MANAGER"),
    updateProduct
);


// ==============================
// DELETE PRODUCT
// ADMIN ONLY
// ==============================

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    deleteProduct
);


module.exports = router;