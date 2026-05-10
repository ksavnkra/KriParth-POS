const express = require("express");
const router = express.Router();
const { getSalesReport, getRevenueReport, getTopProducts, getCashierPerformance, getDashboardStats } = require("../controllers/reports");
const { verifyToken, authorize } = require("../middleware/auth");

router.get("/dashboard", verifyToken, getDashboardStats);
router.get("/sales", verifyToken, authorize("admin", "manager"), getSalesReport);
router.get("/revenue", verifyToken, authorize("admin", "manager"), getRevenueReport);
router.get("/products/top", verifyToken, authorize("admin", "manager"), getTopProducts);
router.get("/cashier-performance", verifyToken, authorize("admin", "manager"), getCashierPerformance);

module.exports = router;
