const { StaffPermission } = require("../models");

const checkStaffPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const staffId = req.user.id;

      let permission = await StaffPermission.findOne({
        where: {
          staff_id: staffId,
          resource: resource,
        },
      });

      if (!permission) {
        permission = await StaffPermission.findOne({
          where: {
            staff_id: staffId,
            resource: 'all',
          },
        });
      }

      if (!permission || !permission[`can_${action}`]) {
        return res.status(403).json({
          success: false,
          message: `Access denied: missing ${action} permission for ${resource}`,
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  };
};

module.exports = checkStaffPermission;
