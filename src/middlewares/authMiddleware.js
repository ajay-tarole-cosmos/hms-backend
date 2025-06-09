const jwt = require("jsonwebtoken");
const { Staff } = require("../models");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized: No token provided"
      );
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Staff.findByPk(decoded.sub);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
    };
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }
    next();
  };
};

module.exports = { authenticateUser, authorizeRoles };
