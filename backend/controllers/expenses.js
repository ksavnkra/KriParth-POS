const Expense = require("../models/expense");

// GET /api/v1/expenses
const getExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Expense.countDocuments();
    const expenses = await Expense.find()
      .populate("incurredBy", "name email")
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({ success: true, data: expenses, meta: { page: parseInt(page), totalItems: total } });
  } catch (err) {
    console.error("Get expenses error:", err.message);
    res.status(500).json({ success: false, error: { message: "Failed to fetch expenses." } });
  }
};

// POST /api/v1/expenses
const createExpense = async (req, res) => {
  try {
    const { name, amount, method, note, date, category } = req.body;
    if (!name || !amount) {
      return res.status(400).json({ success: false, error: { message: "Name and amount are required." } });
    }

    const created = await Expense.create({
      name,
      amount,
      method: method || "cash",
      note: note || "",
      category: category || "Uncategorized",
      date: date || Date.now(),
      incurredBy: (req.user && req.user._id) ? req.user._id : null,
    });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error("Create expense error:", err.message);
    res.status(500).json({ success: false, error: { message: "Failed to create expense." } });
  }
};

// DELETE /api/v1/expenses/:id
const deleteExpense = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, error: { message: "Expense id is required." } });

    const existing = await Expense.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: "Expense not found or already deleted." } });
    }

    await Expense.deleteOne({ _id: id });
    res.status(200).json({ success: true, data: { message: "Expense deleted." } });
  } catch (err) {
    console.error("Delete expense error:", err.message);
    res.status(500).json({ success: false, error: { message: "Failed to delete expense." } });
  }
};

module.exports = { getExpenses, createExpense, deleteExpense };
