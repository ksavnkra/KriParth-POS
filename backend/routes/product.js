const express = require("express");
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require("../controllers/product");
const { verifyToken, authorize } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/adminAuth");

router.get("/", verifyToken, requireAdmin, getProducts);
router.get("/:id", verifyToken, requireAdmin, getProduct);
router.post("/", verifyToken, requireAdmin, createProduct);
router.put("/:id", verifyToken, requireAdmin, updateProduct);
router.delete("/:id", verifyToken, requireAdmin, deleteProduct);

module.exports = router;
