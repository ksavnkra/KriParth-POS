const express = require("express");
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require("../controllers/category");
const { verifyToken, authorize } = require("../middleware/auth");

router.get("/", verifyToken, getCategories);
router.post("/", verifyToken, authorize("admin", "manager"), createCategory);
router.put("/:id", verifyToken, authorize("admin", "manager"), updateCategory);
router.delete("/:id", verifyToken, authorize("admin"), deleteCategory);

module.exports = router;
