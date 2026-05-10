const Category = require("../models/category");

// GET /api/v1/categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate("parentCategory", "name")
      .sort({ name: 1 });

    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to fetch categories." },
    });
  }
};

// POST /api/v1/categories
const createCategory = async (req, res) => {
  try {
    const { name, description, parentCategory } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Category name is required." },
      });
    }

    const existing = await Category.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: "DUPLICATE_CATEGORY", message: "Category with this name already exists." },
      });
    }

    const category = await Category.create({
      name,
      description: description || "",
      parentCategory: parentCategory || null,
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    console.error("Create category error:", err.message);
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to create category." },
    });
  }
};

// PUT /api/v1/categories/:id
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Category not found." },
      });
    }

    if (req.body.name !== undefined) category.name = req.body.name;
    if (req.body.description !== undefined) category.description = req.body.description;
    if (req.body.parentCategory !== undefined) category.parentCategory = req.body.parentCategory;
    if (req.body.isActive !== undefined) category.isActive = req.body.isActive;

    await category.save();
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to update category." },
    });
  }
};

// DELETE /api/v1/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Category not found." },
      });
    }

    category.isActive = false;
    await category.save();

    res.status(200).json({
      success: true,
      data: { message: "Category deactivated." },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to delete category." },
    });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
