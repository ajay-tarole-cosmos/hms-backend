const jwt = require('jsonwebtoken');
const { Staff } = require('../models');
const config = require('../config/config');

// Middleware to authenticate user using JWT
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized: No token provided"
      );
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    console.log("decoded",decoded)
    const user = await Staff.findByPk(decoded.sub);
    console.log("user",user)
    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to authorize user based on role
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizeRoles,
};
