const express = require("express");
const router = express.Router();
const { createSale, getSales, getSale, refundSale } = require("../controllers/sales");
const { verifyToken, authorize } = require("../middleware/auth");
const { requireAdmin, requireAdminOrManager } = require("../middleware/adminAuth");

router.post("/", verifyToken, createSale);
router.get("/", verifyToken, requireAdminOrManager, getSales);
router.get("/:id", verifyToken, getSale);
router.post("/:id/refund", verifyToken, requireAdmin, refundSale);

module.exports = router;
