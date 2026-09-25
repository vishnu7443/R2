const prisma = require("../config/prisma");
const demoStore = require("../services/demoStore");

// ======================================
// CREATE PRODUCT
// ======================================
exports.createProduct = async (req, res) => {
  try {
    const { name, sku, price, stock, categoryId, supplierId } = req.body;

    try {
      const product = await prisma.product.create({
        data: {
          name,
          sku,
          price: Number(price),
          stock: Number(stock),
          categoryId: Number(categoryId),
          supplierId: Number(supplierId),
        },
        include: {
          category: true,
          supplier: true,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Product Created Successfully",
        data: product,
      });
    } catch (dbErr) {
      console.warn("DB offline, creating product in demo store:", dbErr.message);
      const product = demoStore.createProduct({
        name,
        sku,
        price,
        stock,
        categoryId,
        supplierId,
      });

      return res.status(201).json({
        success: true,
        message: "Product Created Successfully (Demo Mode)",
        data: product,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Product creation failed",
      error: error.message,
    });
  }
};

// ======================================
// GET ALL PRODUCTS
// ======================================
exports.getProducts = async (req, res) => {
  try {
    try {
      const products = await prisma.product.findMany({
        include: {
          category: true,
          supplier: true,
        },
        orderBy: { id: "desc" },
      });

      if (products && products.length > 0) {
        return res.status(200).json({
          success: true,
          data: products,
        });
      }
    } catch (dbErr) {
      console.warn("DB offline, fetching products from demo store:", dbErr.message);
    }

    return res.status(200).json({
      success: true,
      data: demoStore.getProducts(),
    });
  } catch (error) {
    console.error(error);
    return res.status(200).json({
      success: true,
      data: demoStore.getProducts(),
    });
  }
};

// ======================================
// GET PRODUCT BY ID
// ======================================
exports.getProductById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          supplier: true,
        },
      });

      if (product) {
        return res.status(200).json({
          success: true,
          data: product,
        });
      }
    } catch (dbErr) {
      console.warn("DB offline, searching demo store for product:", dbErr.message);
    }

    const demoProduct = demoStore.getProductById(id);
    if (!demoProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: demoProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

// ======================================
// UPDATE PRODUCT
// ======================================
exports.updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, sku, price, stock, categoryId, supplierId } = req.body;

    try {
      const product = await prisma.product.update({
        where: { id },
        data: {
          name,
          sku,
          price: Number(price),
          stock: Number(stock),
          categoryId: Number(categoryId),
          supplierId: Number(supplierId),
        },
        include: {
          category: true,
          supplier: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: product,
      });
    } catch (dbErr) {
      console.warn("DB offline, updating product in demo store:", dbErr.message);
      const updated = demoStore.updateProduct(id, {
        name,
        sku,
        price,
        stock,
        categoryId,
        supplierId,
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Product not found in demo store",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Product updated successfully (Demo Mode)",
        data: updated,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

// ======================================
// DELETE PRODUCT
// ======================================
exports.deleteProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    try {
      await prisma.product.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (dbErr) {
      console.warn("DB offline, deleting product from demo store:", dbErr.message);
      demoStore.deleteProduct(id);
      return res.status(200).json({
        success: true,
        message: "Product deleted successfully (Demo Mode)",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};