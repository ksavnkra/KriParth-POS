const express = require("express");
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require("../controllers/product");
const { verifyToken, authorize } = require("../middleware/auth");

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", verifyToken, authorize("admin", "manager"), createProduct);
router.put("/:id", verifyToken, authorize("admin", "manager"), updateProduct);
router.delete("/:id", verifyToken, authorize("admin", "manager"), deleteProduct);

module.exports = router;
