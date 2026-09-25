const prisma = require("../config/prisma");
const demoStore = require("../services/demoStore");

// ======================================
// CREATE SALE
// ======================================

exports.createSale = async (req, res) => {
  try {
    const { customerId, invoiceNumber, items } = req.body;

    // -----------------------------
    // Validation
    // -----------------------------

    if (!customerId || !invoiceNumber || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Customer, invoice number and items are required",
      });
    }

    // Check Customer

    const customer = await prisma.customer.findUnique({
      where: {
        id: Number(customerId),
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check Invoice Duplicate

    const invoice = await prisma.sale.findUnique({
      where: {
        invoiceNumber,
      },
    });

    if (invoice) {
      return res.status(400).json({
        success: false,
        message: "Invoice number already exists",
      });
    }

    // -----------------------------
    // Transaction
    // -----------------------------

    const sale = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;

      // Calculate Total

      for (const item of items) {
        totalAmount +=
          Number(item.quantity) *
          Number(item.unitPrice);
      }

      // Create Sale

      const newSale = await tx.sale.create({
        data: {
          customerId: Number(customerId),
          invoiceNumber,
          totalAmount,
          status: "COMPLETED",
        },
      });

      // Process Every Item

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: {
            id: Number(item.productId),
          },
        });

        if (!product) {
          throw new Error(
            `Product ${item.productId} not found`
          );
        }

        // Check Stock

        if (product.stock < Number(item.quantity)) {
          throw new Error(
            `${product.name} has insufficient stock`
          );
        }

        // Create Sale Item

        await tx.saleItem.create({
          data: {
            saleId: newSale.id,

            productId: Number(item.productId),

            quantity: Number(item.quantity),

            unitPrice: Number(item.unitPrice),

            totalPrice:
              Number(item.quantity) *
              Number(item.unitPrice),
          },
        });

        // Reduce Product Stock

        await tx.product.update({
          where: {
            id: Number(item.productId),
          },

          data: {
            stock: {
              decrement: Number(item.quantity),
            },
          },
        });

        // Inventory Transaction

        await tx.inventoryTransaction.create({
          data: {
            productId: Number(item.productId),

            type: "STOCK_OUT",

            quantity: Number(item.quantity),

            remarks:
              `Sales Invoice ${invoiceNumber}`,
          },
        });
      }

      return newSale;
    });

    res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: sale,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// GET ALL SALES
// ======================================

exports.getAllSales = async (req, res) => {
  try {
    try {
      const sales = await prisma.sale.findMany({
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (sales && sales.length > 0) {
        return res.status(200).json({
          success: true,
          count: sales.length,
          data: sales,
        });
      }
    } catch (dbErr) {
      console.warn("DB offline, fetching sales from demo store:", dbErr.message);
    }

    const demoSales = demoStore.getSales();
    return res.status(200).json({
      success: true,
      count: demoSales.length,
      data: demoSales,
    });
  } catch (error) {
    console.error(error);
    const demoSales = demoStore.getSales();
    return res.status(200).json({
      success: true,
      count: demoSales.length,
      data: demoSales,
    });
  }
};

// ======================================
// GET SALE BY ID
// ======================================

exports.getSaleById = async (req, res) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: {
        id: Number(req.params.id),
      },

      include: {
        customer: true,

        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    res.status(200).json({
      success: true,
      data: sale,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================================
// UPDATE SALE STATUS
// ======================================

exports.updateSaleStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const sale = await prisma.sale.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    const updatedSale = await prisma.sale.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        status,
      },
    });

    res.status(200).json({
      success: true,
      message: "Sale status updated successfully",
      data: updatedSale,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================================
// DELETE SALE
// ======================================

exports.deleteSale = async (req, res) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        items: true,
      },
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    await prisma.$transaction(async (tx) => {
      // Restore Product Stock

      for (const item of sale.items) {
        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });

        // Inventory Transaction

        await tx.inventoryTransaction.create({
          data: {
            productId: item.productId,
            type: "ADJUSTMENT",
            quantity: item.quantity,
            remarks: `Sale ${sale.invoiceNumber} deleted`,
          },
        });
      }

      // Delete Sale
      // SaleItems will automatically be deleted
      // because of Cascade delete

      await tx.sale.delete({
        where: {
          id: Number(req.params.id),
        },
      });
    });

    res.status(200).json({
      success: true,
      message: "Sale deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};