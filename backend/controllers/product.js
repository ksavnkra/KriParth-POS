const Product = require("../models/product");

// GET /api/v1/products
const getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("category", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: products,
      meta: {
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
      },
    });
  } catch (err) {
    console.error("Get products error:", err.message);
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to fetch products." },
    });
  }
};

// GET /api/v1/products/:id
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("createdBy", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Product not found." },
      });
    }

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to fetch product." },
    });
  }
};

// POST /api/v1/products
const createProduct = async (req, res) => {
  try {
    const { name, sku, description, price, costPrice, stock, lowStockThreshold, unit, image, category } = req.body;

    if (!name || !sku || !price || !costPrice) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Name, SKU, price and costPrice are required." },
      });
    }

    // check duplicate sku
    const normalizedSku = String(sku).toUpperCase();
    const existingSku = await Product.findOne({ sku: normalizedSku });
    if (existingSku) {
      return res.status(409).json({
        success: false,
        error: { code: "DUPLICATE_SKU", message: "A product with this SKU already exists." },
      });
    }

    const product = await Product.create({
      name,
      sku: normalizedSku,
      description: description || "",
      price,
      costPrice,
      stock: stock || 0,
      lowStockThreshold: lowStockThreshold || 5,
      unit: unit || "piece",
      image: image || "",
      // category is optional now; frontend may omit it
      category: category || null,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    console.error("Create product error:", err.message);
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to create product." },
    });
  }
};

// PUT /api/v1/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Product not found." },
      });
    }

    // only update fields that were sent
    const allowedFields = ["name", "description", "price", "costPrice", "stock", "lowStockThreshold", "unit", "image", "category", "isActive"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    console.error("Update product error:", err.message);
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to update product." },
    });
  }
};

// DELETE /api/v1/products/:id  (soft delete)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Product not found." },
      });
    }

    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      data: { message: "Product deactivated successfully." },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to delete product." },
    });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
