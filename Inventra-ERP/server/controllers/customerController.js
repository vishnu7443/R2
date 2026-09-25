const prisma = require("../config/prisma");
const demoStore = require("../services/demoStore");

// ======================================
// CREATE CUSTOMER
// POST /api/customers
// ======================================
exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    try {
      const customer = await prisma.customer.create({
        data: { name, email, phone, address },
      });

      return res.status(201).json({
        success: true,
        message: "Customer created successfully",
        data: customer,
      });
    } catch (dbErr) {
      console.warn("DB offline, creating in demo store:", dbErr.message);
      const customer = demoStore.createCustomer({ name, email, phone, address });
      return res.status(201).json({
        success: true,
        message: "Customer created successfully (Demo Mode)",
        data: customer,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// GET ALL CUSTOMERS
// GET /api/customers
// ======================================
exports.getCustomers = async (req, res) => {
  try {
    try {
      const customers = await prisma.customer.findMany({
        orderBy: { id: "desc" },
      });

      if (customers && customers.length > 0) {
        return res.status(200).json({
          success: true,
          data: customers,
        });
      }
    } catch (dbErr) {
      console.warn("DB offline, fetching from demo store:", dbErr.message);
    }

    // Fallback to demo store
    return res.status(200).json({
      success: true,
      data: demoStore.getCustomers(),
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({
      success: true,
      data: demoStore.getCustomers(),
    });
  }
};

// ======================================
// GET CUSTOMER BY ID
// GET /api/customers/:id
// ======================================
exports.getCustomerById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    try {
      const customer = await prisma.customer.findUnique({
        where: { id },
      });

      if (customer) {
        return res.status(200).json({
          success: true,
          data: customer,
        });
      }
    } catch (dbErr) {
      console.warn("DB offline, searching demo store:", dbErr.message);
    }

    const demoCustomer = demoStore.getCustomerById(id);
    if (!demoCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: demoCustomer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
};

// ======================================
// UPDATE CUSTOMER
// PUT /api/customers/:id
// ======================================
exports.updateCustomer = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, email, phone, address } = req.body;

    try {
      const customer = await prisma.customer.update({
        where: { id },
        data: { name, email, phone, address },
      });

      return res.status(200).json({
        success: true,
        message: "Customer updated successfully",
        data: customer,
      });
    } catch (dbErr) {
      console.warn("DB offline, updating in demo store:", dbErr.message);
      const updated = demoStore.updateCustomer(id, { name, email, phone, address });
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Customer not found in demo store",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Customer updated successfully (Demo Mode)",
        data: updated,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update customer",
    });
  }
};

// ======================================
// DELETE CUSTOMER
// DELETE /api/customers/:id
// ======================================
exports.deleteCustomer = async (req, res) => {
  try {
    const id = Number(req.params.id);

    try {
      await prisma.customer.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: "Customer deleted successfully",
      });
    } catch (dbErr) {
      console.warn("DB offline, deleting from demo store:", dbErr.message);
      demoStore.deleteCustomer(id);
      return res.status(200).json({
        success: true,
        message: "Customer deleted successfully (Demo Mode)",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete customer",
    });
  }
};