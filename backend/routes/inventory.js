const express = require("express");
const router = express.Router();
const { getStockLevels, getLowStockAlerts, adjustStock, getInventoryLogs } = require("../controllers/inventory");
const { verifyToken, authorize } = require("../middleware/auth");
const { requireAdmin, requireAdminOrManager } = require("../middleware/adminAuth");

router.get("/", verifyToken, getStockLevels);
router.get("/alerts", verifyToken, requireAdminOrManager, getLowStockAlerts);
router.post("/adjust", verifyToken, requireAdminOrManager, adjustStock);
router.get("/logs", verifyToken, requireAdminOrManager, getInventoryLogs);

module.exports = router;
