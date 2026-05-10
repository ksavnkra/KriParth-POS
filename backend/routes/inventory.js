const express = require("express");
const router = express.Router();
const { getStockLevels, getLowStockAlerts, adjustStock, getInventoryLogs } = require("../controllers/inventory");
const { verifyToken, authorize } = require("../middleware/auth");

router.get("/", verifyToken, getStockLevels);
router.get("/alerts", verifyToken, authorize("admin", "manager"), getLowStockAlerts);
router.post("/adjust", verifyToken, authorize("admin", "manager"), adjustStock);
router.get("/logs", verifyToken, authorize("admin", "manager"), getInventoryLogs);

module.exports = router;
