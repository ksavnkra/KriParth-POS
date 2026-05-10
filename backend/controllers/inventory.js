const Product = require("../models/product");
const InventoryLog = require("../models/inventory");

// GET /api/v1/inventory — stock levels for all active products
const getStockLevels = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .select("name sku stock lowStockThreshold unit category")
      .populate("category", "name")
      .sort({ name: 1 });

    res.status(200).json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to fetch stock levels." },
    });
  }
};

// GET /api/v1/inventory/alerts — products below low stock threshold
const getLowStockAlerts = async (req, res) => {
  try {
    const alerts = await Product.find({
      isActive: true,
      $expr: { $lte: ["$stock", "$lowStockThreshold"] },
    })
      .select("name sku stock lowStockThreshold unit")
      .sort({ stock: 1 });

    res.status(200).json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to fetch low stock alerts." },
    });
  }
};

// POST /api/v1/inventory/adjust — manual stock adjustment
const adjustStock = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "productId and quantity are required." },
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Product not found." },
      });
    }

    const prevStock = product.stock;
    const newStock = prevStock + quantity;

    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_ADJUSTMENT", message: "Stock cannot go below zero." },
      });
    }

    product.stock = newStock;
    await product.save();

    const logType = quantity > 0 ? "restock" : "adjustment";

    await InventoryLog.create({
      product: productId,
      type: logType,
      quantity,
      previousStock: prevStock,
      newStock,
      reason: reason || "Manual adjustment",
      performedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      data: {
        product: product.name,
        previousStock: prevStock,
        adjustment: quantity,
        newStock,
      },
    });
  } catch (err) {
    console.error("Stock adjust error:", err.message);
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to adjust stock." },
    });
  }
};

// GET /api/v1/inventory/logs — inventory change history
const getInventoryLogs = async (req, res) => {
  try {
    const { product, type, page = 1, limit = 30 } = req.query;
    const filter = {};

    if (product) filter.product = product;
    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await InventoryLog.countDocuments(filter);
    const logs = await InventoryLog.find(filter)
      .populate("product", "name sku")
      .populate("performedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: logs,
      meta: {
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to fetch inventory logs." },
    });
  }
};

module.exports = { getStockLevels, getLowStockAlerts, adjustStock, getInventoryLogs };
