const prisma = require("../config/prisma");
const demoStore = require("../services/demoStore");

// ======================================
// CREATE PURCHASE
// ======================================

exports.createPurchase = async (req, res) => {
  try {
    const {
      invoiceNumber,
      supplierId,
      purchaseDate,
      notes,
      items,
    } = req.body;

    // -----------------------------
    // Validation
    // -----------------------------

    if (
      !invoiceNumber ||
      !supplierId ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invoice number, supplier and items are required",
      });
    }

    // -----------------------------
    // Check Supplier
    // -----------------------------

    const supplier = await prisma.supplier.findUnique({
      where: {
        id: Number(supplierId),
      },
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    // -----------------------------
    // Duplicate Invoice Check
    // -----------------------------

    const existingPurchase =
      await prisma.purchase.findUnique({
        where: {
          invoiceNumber,
        },
      });

    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message: "Invoice number already exists",
      });
    }

    // -----------------------------
    // Transaction
    // -----------------------------

    const purchase = await prisma.$transaction(
      async (tx) => {
        let totalAmount = 0;

        // Calculate Total

        for (const item of items) {
          totalAmount +=
            Number(item.quantity) *
            Number(item.price);
        }

        // Create Purchase

        const newPurchase =
          await tx.purchase.create({
            data: {
              invoiceNumber,
              supplierId: Number(supplierId),
              purchaseDate: purchaseDate
                ? new Date(purchaseDate)
                : new Date(),
              notes,
              totalAmount,
            },
          });

        // Create Purchase Items
        // Update Product Stock

        for (const item of items) {
          const product =
            await tx.product.findUnique({
              where: {
                id: Number(item.productId),
              },
            });

          if (!product) {
            throw new Error(
              `Product ${item.productId} not found`
            );
          }

          const subtotal =
            Number(item.quantity) *
            Number(item.price);

          await tx.purchaseItem.create({
            data: {
              purchaseId: newPurchase.id,
              productId: Number(item.productId),
              quantity: Number(item.quantity),
              price: Number(item.price),
              subtotal,
            },
          });

          await tx.product.update({
            where: {
              id: Number(item.productId),
            },
            data: {
              stock: {
                increment: Number(item.quantity),
              },
            },
          });
        }

        return newPurchase;
      }
    );

    res.status(201).json({
      success: true,
      message: "Purchase created successfully",
      data: purchase,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ======================================
// GET ALL PURCHASES
// ======================================

exports.getPurchases = async (req, res) => {
  try {
    try {
      const purchases = await prisma.purchase.findMany({
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          id: "desc",
        },
      });

      if (purchases && purchases.length > 0) {
        return res.status(200).json({
          success: true,
          count: purchases.length,
          data: purchases,
        });
      }
    } catch (dbErr) {
      console.warn("DB offline, fetching purchases from demo store");
    }

    const demoPurchases = demoStore.getPurchases();
    return res.status(200).json({
      success: true,
      count: demoPurchases.length,
      data: demoPurchases,
    });
  } catch (error) {
    const demoPurchases = demoStore.getPurchases();
    return res.status(200).json({
      success: true,
      count: demoPurchases.length,
      data: demoPurchases,
    });
  }
};

// ======================================
// GET PURCHASE BY ID
// ======================================

exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    res.status(200).json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch purchase",
      error: error.message,
    });
  }
};
// ======================================
// UPDATE PURCHASE
// ======================================

exports.updatePurchase = async (req, res) => {
  try {
    const purchaseId = Number(req.params.id);

    const {
      invoiceNumber,
      supplierId,
      purchaseDate,
      notes,
      items,
    } = req.body;

    // Validation

    if (
      !invoiceNumber ||
      !supplierId ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invoice number, supplier and items are required",
      });
    }

    // Existing Purchase

    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        id: purchaseId,
      },
      include: {
        items: true,
      },
    });

    if (!existingPurchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    // Check Duplicate Invoice

    const duplicateInvoice = await prisma.purchase.findFirst({
      where: {
        invoiceNumber,
        NOT: {
          id: purchaseId,
        },
      },
    });

    if (duplicateInvoice) {
      return res.status(400).json({
        success: false,
        message: "Invoice number already exists",
      });
    }

    const purchase = await prisma.$transaction(async (tx) => {

      // Restore Previous Stock

      for (const item of existingPurchase.items) {
        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Delete Previous Purchase Items

      await tx.purchaseItem.deleteMany({
        where: {
          purchaseId,
        },
      });

      let totalAmount = 0;

      // Create New Purchase Items

      for (const item of items) {

        const subtotal =
          Number(item.quantity) *
          Number(item.price);

        totalAmount += subtotal;

        await tx.purchaseItem.create({
          data: {
            purchaseId,
            productId: Number(item.productId),
            quantity: Number(item.quantity),
            price: Number(item.price),
            subtotal,
          },
        });

        // Increase Stock Again

        await tx.product.update({
          where: {
            id: Number(item.productId),
          },
          data: {
            stock: {
              increment: Number(item.quantity),
            },
          },
        });
      }

      // Update Purchase

      return await tx.purchase.update({
        where: {
          id: purchaseId,
        },
        data: {
          invoiceNumber,
          supplierId: Number(supplierId),
          purchaseDate: purchaseDate
            ? new Date(purchaseDate)
            : new Date(),
          notes,
          totalAmount,
        },
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

    });

    res.status(200).json({
      success: true,
      message: "Purchase updated successfully",
      data: purchase,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ======================================
// DELETE PURCHASE
// ======================================

exports.deletePurchase = async (req, res) => {
  try {
    const purchaseId = Number(req.params.id);

    const purchase = await prisma.purchase.findUnique({
      where: {
        id: purchaseId,
      },
      include: {
        items: true,
      },
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    await prisma.$transaction(async (tx) => {

      // Reduce Product Stock

      for (const item of purchase.items) {
        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Delete Purchase Items

      await tx.purchaseItem.deleteMany({
        where: {
          purchaseId,
        },
      });

      // Delete Purchase

      await tx.purchase.delete({
        where: {
          id: purchaseId,
        },
      });

    });

    res.status(200).json({
      success: true,
      message: "Purchase deleted successfully",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};