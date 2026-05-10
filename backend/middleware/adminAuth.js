const jwt = require("jsonwebtoken");
const User = require("../models/user");

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "NOT_AUTHENTICATED",
          message: "Please login first.",
        },
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: {
          code: "ADMIN_REQUIRED",
          message: `Admin privileges required. Current role: '${req.user.role}'.`,
        },
      });
    }

    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        error: {
          code: "ACCOUNT_DISABLED",
          message: "Admin account has been deactivated.",
        },
      });
    }

    next();
  } catch (err) {
    console.error("Admin auth error:", err.message);
    return res.status(500).json({
      success: false,
      error: {
        code: "ADMIN_AUTH_ERROR",
        message: "Error verifying admin privileges.",
      },
    });
  }
};

const requireAdminOrManager = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: "NOT_AUTHENTICATED",
        message: "Please login first.",
      },
    });
  }

  if (!["admin", "manager"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: {
        code: "PERMISSION_DENIED",
        message: `Admin or Manager privileges required. Current role: '${req.user.role}'.`,
      },
    });
  }

  if (!req.user.isActive) {
    return res.status(403).json({
      success: false,
      error: {
        code: "ACCOUNT_DISABLED",
        message: "Account has been deactivated.",
      },
    });
  }

  next();
};

module.exports = { requireAdmin, requireAdminOrManager };
