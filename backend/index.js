require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const categoryRoutes = require("./routes/category");
const salesRoutes = require("./routes/sales");
const inventoryRoutes = require("./routes/inventory");
const stockRoutes = require("./routes/stock");
const customerRoutes = require("./routes/customer");
const reportRoutes = require("./routes/reports");
const aiRoutes = require("./routes/ai");
const expenseRoutes = require("./routes/expenses");
const usersRoutes = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || (process.env.NODE_ENV === 'production' ? 1000 : 10000),
  message: {
    success: false,
    error: { code: "RATE_LIMIT", message: "Too many requests, try again later." },
  },
});
app.use("/api/", limiter);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/sales", salesRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/stock", stockRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/expenses", expenseRoutes);
app.use("/api/v1/users", usersRoutes);

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ success: true, data: { status: "ok" } });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "Route not found." },
  });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
