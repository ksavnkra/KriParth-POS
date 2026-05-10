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
    const { name, amount, method, note, date } = req.body;
    if (!name || !amount) {
      return res.status(400).json({ success: false, error: { message: "Name and amount are required." } });
    }

    const created = await Expense.create({
      name,
      amount,
      method: method || "cash",
      note: note || "",
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
    const fs = require('fs');
    const id = req.params.id;
    try { fs.appendFileSync('/tmp/krp_expense_debug.log', `delete called by ${req.user?.email} id: ${id}\n`); } catch (e) {}
    console.log("deleteExpense called by", req.user?.email, "id:", id);
    if (!id) return res.status(400).json({ success: false, error: { message: "Expense id is required." } });
    // validate ObjectId if mongoose available
    try {
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: { message: "Invalid expense id." } });
      }
    } catch (e) {
      // ignore if mongoose not available (shouldn't happen)
    }

    // try to find the expense first
    const existing = await Expense.findById(id);
    try { fs.appendFileSync('/tmp/krp_expense_debug.log', `found existing: ${!!existing}\n`); } catch (e) {}
    if (!existing) {
      try { fs.appendFileSync('/tmp/krp_expense_debug.log', `not found -> returning 404\n`); } catch (e) {}
      return res.status(404).json({ success: false, error: { message: "Expense not found or already deleted." } });
    }

    let result;
    try {
      result = await Expense.deleteOne({ _id: id });
      try { fs.appendFileSync('/tmp/krp_expense_debug.log', `deleteOne result: ${JSON.stringify(result)}\n`); } catch (e) {}
    } catch (e) {
      try { fs.appendFileSync('/tmp/krp_expense_debug.log', `deleteOne threw: ${e.stack || e}\n`); } catch (ee) {}
      console.error('Expense deleteOne threw', e);
      return res.status(500).json({ success: false, error: { message: e.message || 'Failed to delete expense.' } });
    }

    if (!result || result.deletedCount !== 1) {
      console.error('Expense delete returned unexpected result', result);
      try { fs.appendFileSync('/tmp/krp_expense_debug.log', `unexpected result: ${JSON.stringify(result)}\n`); } catch (e) {}
      return res.status(500).json({ success: false, error: { message: 'Failed to delete expense (DB returned unexpected result).' } });
    }
    res.status(200).json({ success: true, data: { message: "Expense deleted." } });
  } catch (err) {
    try { require('fs').appendFileSync('/tmp/krp_expense_debug.log', `catch err: ${err.stack || err}\n`); } catch (e) {}
    console.error("Delete expense error:", err.stack || err);
    // return stack in development for easier debugging
    const resp = { success: false, error: { message: err.message || "Failed to delete expense." } };
    if (process.env.NODE_ENV !== 'production') resp.error.stack = err.stack;
    res.status(500).json(resp);
  }
};

module.exports = { getExpenses, createExpense, deleteExpense };
