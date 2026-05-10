const express = require("express");
const router = express.Router();
const { queryAI, getInsights, getForecast, getAnomalies } = require("../controllers/ai");
const { verifyToken, authorize } = require("../middleware/auth");

// all AI routes need at least manager access
router.post("/query", verifyToken, authorize("admin", "manager"), queryAI);
router.get("/insights", verifyToken, authorize("admin", "manager"), getInsights);
router.get("/forecast", verifyToken, authorize("admin"), getForecast);
router.get("/anomalies", verifyToken, authorize("admin"), getAnomalies);

module.exports = router;
