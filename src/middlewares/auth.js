const jwt = require('jsonwebtoken');
const { Staff } = require('../models');
const permissions = require('../config/permissions');

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Staff.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const checkPermission = (resource, action = '*') => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const rolePermissions = permissions[userRole];

    if (!rolePermissions) {
      return res.status(403).json({ message: 'Role not found' });
    }

    const hasResourceAccess = rolePermissions.resources.includes('*') || 
                            rolePermissions.resources.includes(resource);
    
    const hasActionAccess = rolePermissions.actions.includes('*') || 
                          rolePermissions.actions.includes(action);

    if (!hasResourceAccess || !hasActionAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  checkPermission
}; 