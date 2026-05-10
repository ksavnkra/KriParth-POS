const express = require("express");
const router = express.Router();
const { register, login, logout, getMe } = require("../controllers/auth");
const { verifyToken, authorize } = require("../middleware/auth");

router.post("/register", verifyToken, authorize("admin"), register);
router.post("/login", login);
router.post("/logout", verifyToken, logout);
router.get("/me", verifyToken, getMe);

module.exports = router;
