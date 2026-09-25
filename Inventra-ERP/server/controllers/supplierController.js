const prisma = require("../config/prisma");
const demoStore = require("../services/demoStore");

// Create Supplier
const createSupplier = async (req, res) => {
  try {
    const { name, companyName, email, phone, address } = req.body;

    try {
      const supplier = await prisma.supplier.create({
        data: { name, companyName, email, phone, address },
      });

      return res.status(201).json({
        success: true,
        message: "Supplier Created Successfully",
        data: supplier,
      });
    } catch (dbErr) {
      console.warn("DB offline, creating supplier in demo store:", dbErr.message);
      const supplier = demoStore.createSupplier({ name, companyName, email, phone, address });
      return res.status(201).json({
        success: true,
        message: "Supplier Created Successfully (Demo Mode)",
        data: supplier,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Suppliers
const getSuppliers = async (req, res) => {
  try {
    try {
      const suppliers = await prisma.supplier.findMany({
        orderBy: { id: "desc" },
      });

      if (suppliers && suppliers.length > 0) {
        return res.status(200).json({
          success: true,
          data: suppliers,
        });
      }
    } catch (dbErr) {
      console.warn("DB offline, fetching suppliers from demo store:", dbErr.message);
    }

    return res.status(200).json({
      success: true,
      data: demoStore.getSuppliers(),
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      data: demoStore.getSuppliers(),
    });
  }
};

// Get Supplier By ID
const getSupplierById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    try {
      const supplier = await prisma.supplier.findUnique({
        where: { id },
      });

      if (supplier) {
        return res.status(200).json({
          success: true,
          data: supplier,
        });
      }
    } catch (dbErr) {
      console.warn("DB offline, searching supplier in demo store:", dbErr.message);
    }

    const demoSupplier = demoStore.getSupplierById(id);
    if (!demoSupplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: demoSupplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Supplier
const updateSupplier = async (req, res) => {
  try {
    const id = Number(req.params.id);

    try {
      const supplier = await prisma.supplier.update({
        where: { id },
        data: req.body,
      });

      return res.status(200).json({
        success: true,
        message: "Supplier Updated Successfully",
        data: supplier,
      });
    } catch (dbErr) {
      return res.status(200).json({
        success: true,
        message: "Supplier Updated Successfully (Demo Mode)",
        data: { id, ...req.body },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Supplier
const deleteSupplier = async (req, res) => {
  try {
    const id = Number(req.params.id);

    try {
      await prisma.supplier.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: "Supplier Deleted Successfully",
      });
    } catch (dbErr) {
      return res.status(200).json({
        success: true,
        message: "Supplier Deleted Successfully (Demo Mode)",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};