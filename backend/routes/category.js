const express = require("express");
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require("../controllers/category");
const { verifyToken, authorize } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/adminAuth");

router.get("/", verifyToken, getCategories);
router.post("/", verifyToken, requireAdmin, createCategory);
router.put("/:id", verifyToken, requireAdmin, updateCategory);
router.delete("/:id", verifyToken, requireAdmin, deleteCategory);

module.exports = router;
