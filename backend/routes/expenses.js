const express = require("express");
const router = express.Router();
const { getExpenses, createExpense, deleteExpense } = require("../controllers/expenses");
const { verifyToken, authorize } = require("../middleware/auth");

router.get("/", verifyToken, authorize("admin", "manager"), getExpenses);
router.post("/", verifyToken, authorize("admin", "manager"), createExpense);
router.delete("/:id", verifyToken, authorize("admin", "manager"), deleteExpense);

module.exports = router;
