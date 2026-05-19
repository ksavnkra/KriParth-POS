const { GoogleGenerativeAI } = require("@google/generative-ai");

const generateReportInsights = async (reportData) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `You are a POS (Point of Sale) business analyst. Analyze the following report data and provide 3-5 concise, actionable insights about the business performance. Focus on:
1. Revenue trends and patterns
2. Top performing products
3. Expense efficiency
4. Cashier performance
5. Customer patterns

CRITICAL INSTRUCTIONS:
- Keep insights brief, practical, and focused on what the business owner should do next.
- Provide insights formatted as clean, semantic HTML. Use HTML tags like <h3> for titles, <ul>/<li> for lists, and <p> for descriptions, and apply inline CSS styling for a modern, beautiful aesthetic (e.g., use colors like #0d9488 for positive metrics or headings, #334155 for text).
- ALWAYS use the Indian Rupee symbol (₹) for all currency values, NEVER use the Dollar sign ($).
- ONLY output the raw HTML, do not wrap it in markdown code blocks.

Report Data:
${JSON.stringify(reportData, null, 2)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("Gemini AI error:", err.message);
    throw new Error("Failed to generate AI insights: " + err.message);
  }
};

const generateRecommendations = async (salesData) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `You are a business consultant for a retail POS system. Based on the following sales data, provide 3-4 specific, actionable recommendations to improve business performance:

Sales Data:
${JSON.stringify(salesData, null, 2)}

Focus on:
1. Inventory optimization
2. Pricing strategy
3. Sales tactics
4. Customer engagement

CRITICAL INSTRUCTIONS:
- Provide recommendations in a brief, numbered format.
- Format the response as clean, semantic HTML with inline CSS styling for a beautiful, modern look. Use <h3> for headings, and <p> or <ul> for the body.
- ALWAYS use the Indian Rupee symbol (₹) for all currency values, NEVER use the Dollar sign ($).
- ONLY output the raw HTML, do not wrap it in markdown code blocks.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("Gemini AI error:", err.message);
    throw new Error("Failed to generate recommendations: " + err.message);
  }
};

module.exports = {
  generateReportInsights,
  generateRecommendations,
};
