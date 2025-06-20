const { roleRights } = require("../config/roles");

const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole) return res.status(403).json({ message: 'No role assigned' });

    const permissions = roleRights.get(userRole) || [];

    if (permissions.includes(requiredPermission) || permissions.includes('manage_everything')) {
      return next();
    }

    return res.status(403).json({ message: 'Forbidden: insufficient rights' });
  };
};

module.exports = checkPermission;
