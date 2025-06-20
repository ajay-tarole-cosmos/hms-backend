const permissions = {
  super_admin: {
    resources: ['*'],
    actions: ['*']
  },
  admin: {
    resources: [
      'dashboard',
      'reservations',
      'rooms',
      'staff',
      'inventory',
      'finance',
      'settings'
    ],
    actions: ['*']
  },
  manager: {
    resources: [
      'dashboard',
      'reservations',
      'rooms',
      'staff'
    ],
    actions: ['*']
  },
  front_desk: {
    resources: [
      'dashboard',
      'reservations',
      'rooms'
    ],
    actions: ['*']
  },
  housekeeping: {
    resources: ['rooms'],
    actions: ['*']
  },
  inventory_manager: {
    resources: ['inventory'],
    actions: ['*']
  },
  finance: {
    resources: ['finance'],
    actions: ['*']
  },
  auditor: {
    resources: ['finance'],
    actions: ['read']
  }
};

module.exports = permissions; 