const express = require("express");
const router = express.Router();
const { getCustomers, getCustomer, createCustomer, updateCustomer } = require("../controllers/customer");
const { verifyToken, authorize } = require("../middleware/auth");

router.get("/", verifyToken, getCustomers);
router.get("/:id", verifyToken, getCustomer);
router.post("/", verifyToken, createCustomer);
router.put("/:id", verifyToken, authorize("admin", "manager"), updateCustomer);

module.exports = router;
