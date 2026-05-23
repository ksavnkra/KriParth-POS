const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// POST /api/v1/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, contact } = req.body;

    if (!name || !email || !password || !contact) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Name, email, password and contact are required." },
      });
    }

    // check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: "DUPLICATE_EMAIL", message: "A user with this email already exists." },
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "cashier",
      contact,
    });

    // don't send password back
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      data: userObj,
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: err.message || "Something went wrong during registration." },
    });
  }
};

// POST /api/v1/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Email and password are required." },
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." },
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: { code: "ACCOUNT_DISABLED", message: "Your account has been deactivated. Contact admin." },
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." },
      });
    }

    // generate jwt
    const jwtSecret = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    // update lastLogin
    user.lastLogin = new Date();
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      data: {
        user: userObj,
        token,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: err.message || "Something went wrong during login." },
    });
  }
};

// POST /api/v1/auth/logout — client-side token removal, just acknowledge
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { message: "Logged out successfully." },
  });
};

// GET /api/v1/auth/me — get current user profile
const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Could not fetch profile." },
    });
  }
};

module.exports = { register, login, logout, getMe };
