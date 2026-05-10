const express = require("express");
const router = express.Router();
const { getSalesReport, getRevenueReport, getTopProducts, getCashierPerformance, getDashboardStats } = require("../controllers/reports");
const { verifyToken, authorize } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/adminAuth");

router.get("/dashboard", verifyToken, requireAdmin, getDashboardStats);
router.get("/sales", verifyToken, requireAdmin, getSalesReport);
router.get("/revenue", verifyToken, requireAdmin, getRevenueReport);
router.get("/products/top", verifyToken, requireAdmin, getTopProducts);
router.get("/cashier-performance", verifyToken, requireAdmin, getCashierPerformance);

module.exports = router;
