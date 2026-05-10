const express = require("express");
const router = express.Router();
const { getExpenses, createExpense, deleteExpense } = require("../controllers/expenses");
const { verifyToken, authorize } = require("../middleware/auth");
const { requireAdmin, requireAdminOrManager } = require("../middleware/adminAuth");

router.get("/", verifyToken, requireAdminOrManager, getExpenses);
router.post("/", verifyToken, requireAdminOrManager, createExpense);
router.delete("/:id", verifyToken, requireAdmin, deleteExpense);

module.exports = router;
