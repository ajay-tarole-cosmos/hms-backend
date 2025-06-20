const { StaffPermission } = require('../models');

const setPermissions = async (staffId, permissions = []) => {
  // permissions = [{ resource: 'reservations', can_view: true, can_add: true, ... }, ...]
  await StaffPermission.destroy({ where: { staff_id: staffId } }); // Clear old ones

  const newPermissions = permissions.map((perm) => ({
    staff_id: staffId,
    ...perm,
  }));

  await StaffPermission.bulkCreate(newPermissions);
};

module.exports = { setPermissions };
