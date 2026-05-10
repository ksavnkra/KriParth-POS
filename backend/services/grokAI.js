const axios = require("axios");

const generateReportInsights = async (reportData) => {
  try {
    if (!process.env.GROK_API_KEY) {
      throw new Error("GROK_API_KEY is not configured");
    }

    const prompt = `You are a POS (Point of Sale) business analyst. Analyze the following report data and provide 3-5 concise, actionable insights about the business performance. Focus on:
1. Revenue trends and patterns
2. Top performing products
3. Expense efficiency
4. Cashier performance
5. Customer patterns

Keep insights brief, practical, and focused on what the business owner should do next.

Report Data:
${JSON.stringify(reportData, null, 2)}

Please provide insights in a structured format with a title and description for each insight.`;

    const response = await axios.post(
      "https://api.x.ai/v1/chat/completions",
      {
        model: "grok-beta",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROK_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error("Invalid response format from Grok API");
    }
  } catch (err) {
    console.error("Grok AI error:", err.message);
    throw new Error("Failed to generate AI insights: " + err.message);
  }
};

const generateRecommendations = async (salesData) => {
  try {
    if (!process.env.GROK_API_KEY) {
      throw new Error("GROK_API_KEY is not configured");
    }

    const prompt = `You are a business consultant for a retail POS system. Based on the following sales data, provide 3-4 specific, actionable recommendations to improve business performance:

Sales Data:
${JSON.stringify(salesData, null, 2)}

Focus on:
1. Inventory optimization
2. Pricing strategy
3. Sales tactics
4. Customer engagement

Provide recommendations in a brief, numbered format.`;

    const response = await axios.post(
      "https://api.x.ai/v1/chat/completions",
      {
        model: "grok-beta",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROK_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error("Invalid response format from Grok API");
    }
  } catch (err) {
    console.error("Grok AI error:", err.message);
    throw new Error("Failed to generate recommendations: " + err.message);
  }
};

module.exports = {
  generateReportInsights,
  generateRecommendations,
};
