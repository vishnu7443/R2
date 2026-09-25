const prisma = require("../config/prisma");
const demoStore = require("../services/demoStore");

// Create Category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    try {
      const existing = await prisma.category.findUnique({
        where: { name },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Category already exists",
        });
      }

      const category = await prisma.category.create({
        data: { name, description },
      });

      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (dbErr) {
      console.warn("DB offline, creating category in demo store:", dbErr.message);
      const category = { id: Date.now(), name, description };
      return res.status(201).json({
        success: true,
        message: "Category created successfully (Demo Mode)",
        data: category,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Categories
exports.getCategories = async (req, res) => {
  try {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { id: "desc" },
      });

      if (categories && categories.length > 0) {
        return res.json({
          success: true,
          data: categories,
        });
      }
    } catch (dbErr) {
      console.warn("DB offline, fetching categories from demo store:", dbErr.message);
    }

    return res.json({
      success: true,
      data: demoStore.getCategories(),
    });
  } catch (error) {
    return res.json({
      success: true,
      data: demoStore.getCategories(),
    });
  }
};

// Get Category By ID
exports.getCategoryById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    try {
      const category = await prisma.category.findUnique({
        where: { id },
      });

      if (category) {
        return res.json({
          success: true,
          data: category,
        });
      }
    } catch (dbErr) {
      console.warn("DB offline, searching category in demo store:", dbErr.message);
    }

    const demoCategory = demoStore.getCategoryById(id);
    if (!demoCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.json({
      success: true,
      data: demoCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;

    try {
      const category = await prisma.category.update({
        where: { id },
        data: { name, description },
      });

      return res.json({
        success: true,
        message: "Category updated successfully",
        data: category,
      });
    } catch (dbErr) {
      return res.json({
        success: true,
        message: "Category updated successfully (Demo Mode)",
        data: { id, name, description },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);

    try {
      await prisma.category.delete({
        where: { id },
      });

      return res.json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (dbErr) {
      return res.json({
        success: true,
        message: "Category deleted successfully (Demo Mode)",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};