const allRoles = {
  super_admin: ['manage_everything'],
  hotel_owner: ['manage_staff', 'view_reports', 'manage_rooms'],
  front_desk: ['create_booking', 'view_booking', 'check_in_out'],
  housekeeping: ['update_room_status', 'view_room_tasks'],
  restaurant_manager: ['manage_orders', 'view_menu', 'assign_waiter'],
  waiter: ['create_order', 'update_order_status'],
  inventory_manager: ['manage_inventory', 'view_stock', 'update_stock'],
  accountant: ['manage_billing', 'view_financial_reports'],
  auditor: ['view_audit_logs', 'view_financial_reports'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
