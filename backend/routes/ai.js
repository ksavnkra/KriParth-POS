const express = require("express");
const router = express.Router();
const { generateReportInsightsController, queryAI, getInsights, getForecast, getAnomalies } = require("../controllers/ai");
const { verifyToken, authorize } = require("../middleware/auth");

// AI routes for report insights (admin only for now)
router.post("/report-insights", verifyToken, authorize("admin"), generateReportInsightsController);

// all other AI routes need at least manager access
router.post("/query", verifyToken, authorize("admin", "manager"), queryAI);
router.get("/insights", verifyToken, authorize("admin", "manager"), getInsights);
router.get("/forecast", verifyToken, authorize("admin"), getForecast);
router.get("/anomalies", verifyToken, authorize("admin"), getAnomalies);

module.exports = router;
