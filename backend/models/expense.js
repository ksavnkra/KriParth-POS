const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["cash", "bank", "upi", "card"], default: "cash" },
    note: { type: String, default: "" },
    incurredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", ExpenseSchema);
