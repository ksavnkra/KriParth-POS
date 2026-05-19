const express = require("express");
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require("../controllers/product");
const { verifyToken, authorize } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/adminAuth");

router.get("/", verifyToken, getProducts);
router.get("/:id", verifyToken, getProduct);
router.post("/", verifyToken, requireAdmin, createProduct);
router.put("/:id", verifyToken, requireAdmin, updateProduct);
router.delete("/:id", verifyToken, requireAdmin, deleteProduct);

module.exports = router;
