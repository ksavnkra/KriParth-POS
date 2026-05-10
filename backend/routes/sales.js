const express = require("express");
const router = express.Router();
const { createSale, getSales, getSale, refundSale } = require("../controllers/sales");
const { verifyToken, authorize } = require("../middleware/auth");

router.post("/", verifyToken, createSale);
router.get("/", verifyToken, authorize("admin", "manager"), getSales);
router.get("/:id", verifyToken, getSale);
router.post("/:id/refund", verifyToken, authorize("admin", "manager"), refundSale);

module.exports = router;
