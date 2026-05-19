const express = require("express");
const router = express.Router();
const { getSalesReport, getRevenueReport, getTopProducts, getCashierPerformance, getDashboardStats } = require("../controllers/reports");
const { verifyToken, authorize } = require("../middleware/auth");
const { requireAdmin, requireAdminOrManager } = require("../middleware/adminAuth");

router.get("/dashboard", verifyToken, requireAdminOrManager, getDashboardStats);
router.get("/sales", verifyToken, requireAdminOrManager, getSalesReport);
router.get("/revenue", verifyToken, requireAdminOrManager, getRevenueReport);
router.get("/products/top", verifyToken, requireAdminOrManager, getTopProducts);
router.get("/cashier-performance", verifyToken, requireAdmin, getCashierPerformance);

module.exports = router;
