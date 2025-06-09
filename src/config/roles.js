const allRoles = {
  super_admin: ['manageAdmins', 'manageDepartments', 'manageAll'],
  admin: ['getUsers', 'manageUsers', 'manageDepartments'],
  department_admin: ['getUsers', 'manageUsers', 'manageDepartmentModules'],
  user: ['readModules'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
