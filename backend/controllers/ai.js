const Sale = require("../models/invoice");

// TODO: integrate Grok AI SDK here
// const grokClient = require("../config/grok"); // will add when integrating AI

// POST /api/v1/ai/query — natural language business query
// This is where Grok AI will process NLP queries like "what sold most last week?"
const queryAI = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Question is required." },
      });
    }

    // TODO: Grok AI integration
    // 1. fetch relevant data from DB based on the question context
    // 2. build a structured prompt with the data
    // 3. send to Grok AI API
    // 4. parse and return the response

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

// GET /api/v1/ai/insights — AI-generated business insights
const getInsights = async (req, res) => {
  try {
    // TODO: Grok AI integration
    // 1. aggregate last 30 days of sales, inventory, customer data
    // 2. build context prompt for Grok
    // 3. call Grok AI API with "analyze trends and give insights"
    // 4. cache the response (15 min TTL)
    // 5. return formatted insights

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

// GET /api/v1/ai/forecast — sales forecasting
const getForecast = async (req, res) => {
  try {
    // TODO: Grok AI integration
    // 1. fetch last 90 days of sales data
    // 2. send time-series data to Grok with "predict next 30 days"
    // 3. return forecast data points

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

// GET /api/v1/ai/anomalies — anomaly detection
const getAnomalies = async (req, res) => {
  try {
    // TODO: Grok AI integration
    // 1. fetch recent refunds, void transactions, unusual sales patterns
    // 2. send to Grok with "flag unusual patterns and anomalies"
    // 3. return alert list with severity

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

module.exports = { queryAI, getInsights, getForecast, getAnomalies };
