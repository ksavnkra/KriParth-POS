const jwt = require("jsonwebtoken");
const User = require("../models/user");

// verify JWT from Authorization header
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Development convenience: allow unauthenticated GET requests so the POS
    // frontend can fetch product lists without a token. In production, ensure
    // NODE_ENV is set and tighten this check as needed.
    if ((!authHeader || !authHeader.startsWith("Bearer ")) && req.method === "GET") {
      return next();
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: { code: "NO_TOKEN", message: "Access denied. No token provided." },
      });
    }

  const token = authHeader.split(" ")[1];
  const jwtSecret = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
  const decoded = jwt.verify(token, jwtSecret);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: "USER_NOT_FOUND", message: "User no longer exists." },
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: { code: "ACCOUNT_DISABLED", message: "Account has been deactivated." },
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: { code: "TOKEN_EXPIRED", message: "Token has expired. Please login again." },
      });
    }
    return res.status(401).json({
      success: false,
      error: { code: "INVALID_TOKEN", message: "Invalid token." },
    });
  }
};

// role-based access — pass allowed roles as arguments
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: "NOT_AUTHENTICATED", message: "Please login first." },
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: `Role '${req.user.role}' is not allowed to access this resource.`,
        },
      });
    }
    next();
  };
};

module.exports = { verifyToken, authorize };
