const Sale = require("../models/invoice");
const { generateReportInsights, generateRecommendations } = require("../services/grokAI");

const generateReportInsightsController = async (req, res) => {
  try {
    const { reportData } = req.body;

    if (!reportData) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Report data is required." },
      });
    }

    const insights = await generateReportInsights(reportData);

    res.status(200).json({
      success: true,
      data: {
        insights,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("AI insights generation error:", err.message);
    res.status(500).json({
      success: false,
      error: { 
        code: "AI_ERROR", 
        message: err.message || "Failed to generate AI insights" 
      },
    });
  }
};

const queryAI = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Question is required." },
      });
    }

    res.status(501).json({
      success: false,
      error: { code: "NOT_IMPLEMENTED", message: "AI query feature is under development." },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "AI query failed." },
    });
  }
};

const getInsights = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      error: { code: "NOT_IMPLEMENTED", message: "AI insights feature is under development." },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to fetch insights." },
    });
  }
};

const getForecast = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      error: { code: "NOT_IMPLEMENTED", message: "Sales forecasting is under development." },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Forecast generation failed." },
    });
  }
};

const getAnomalies = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      error: { code: "NOT_IMPLEMENTED", message: "Anomaly detection is under development." },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Anomaly detection failed." },
    });
  }
};

module.exports = { generateReportInsightsController, queryAI, getInsights, getForecast, getAnomalies };
