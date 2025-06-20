const defaultPermissions = {
  super_admin: [
    { resource: 'dashboard', can_view: true, can_add: true, can_update: true, can_delete: true  },
    { resource: 'reservation', can_view: true, can_add: true, can_update: true, can_delete: true },
    { resource: 'reports',can_view: true, can_add: true, can_update: true, can_delete: true },
    { resource: 'front_desk', can_view: true, can_add: true, can_update: true, can_delete: true  },
    { resource: 'inventory', can_view: true, can_add: true, can_update: true, can_delete: true },
    { resource: 'rooms', can_view: true, can_add: true, can_update: true, can_delete: true },
    { resource: 'restaurant', can_view: true, can_add: true, can_update: true, can_delete: true },
    { resource: 'departments',can_view: true, can_add: true, can_update: true, can_delete: true  },
    { resource: 'user_management', can_view: true, can_add: true, can_update: true, can_delete: true },
    { resource: 'procurement', can_view: true, can_add: true, can_update: true, can_delete: true },
    { resource: 'setting', can_view: true, can_add: true, can_update: true, can_delete: true }
  ],

  admin: [
    { resource: 'dashboard', can_view: true, can_add: false, can_update: false, can_delete: false },
    { resource: 'reservation', can_view: true, can_add: true, can_update: true ,can_delete:false},
    { resource: 'reports', can_view: true ,can_add: false, can_update: false, can_delete: false},
    { resource: 'front_desk', can_view: true, can_add: true, can_update: true ,can_delete:false},
    { resource: 'inventory', can_view: true, can_add: true, can_update: true, can_delete: true },
    { resource: 'rooms', can_view: true, can_add: true, can_update: true, can_delete: true },
    { resource: 'restaurant', can_view: true, can_add: true, can_update: true, can_delete: true },
    { resource: 'departments', can_view: true, can_add: true, can_update: true ,can_delete:false},
    { resource: 'user_management', can_view: true, can_add: true, can_update: true, can_delete: true },
    { resource: 'procurement', can_view: true, can_add: true, can_update: true, can_delete: true },
    { resource: 'setting', can_view: true, can_add: true, can_update: true, can_delete: true }
  ],

  front_desk: [
    { resource: 'reservation', can_view: true, can_add: true, can_update: true,can_delete: false },
    { resource: 'rooms', can_view: true ,can_add: false, can_update: false, can_delete: false},
    { resource: 'front_desk', can_view: true, can_add: true, can_update: true ,can_delete:false},
    { resource: 'restaurant', can_view: true ,can_add: false, can_update: false, can_delete: false},
    { resource: 'reports', can_view: true,can_add: false, can_update: false, can_delete: false },
    { resource: 'dashboard', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'inventory', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'setting', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'departments', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'user_management', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'procurement', can_view: false ,can_add: false, can_update: false, can_delete: false},
   
  ],

  housekeeping: [
    { resource: 'rooms', can_view: true,can_add:true, can_update: true ,can_delete:false},
    { resource: 'dashboard', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'reservation', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'front_desk', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'inventory', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'reports', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'restaurant', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'departments', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'user_management', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'procurement', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'setting', can_view: false ,can_add: false, can_update: false, can_delete: false},  

  ],

  manager: [
    { resource: 'dashboard', can_view: true ,can_add: false, can_update: false, can_delete: false},
    { resource: 'reports', can_view: true,can_add: false, can_update: false, can_delete: false },
    { resource: 'reservation', can_view: true,can_add: true, can_update: true, can_delete: false },
    { resource: 'rooms', can_view: true,can_add: true, can_update: true, can_delete: false},
    { resource: 'restaurant', can_view: true, can_add: true, can_update: true },
    { resource: 'departments', can_view: true, can_add: false, can_update: false, can_delete: false },
    { resource: 'inventory', can_view: true, can_add: true, can_update: true, can_delete: false},
    { resource: 'procurement', can_view: true,can_add: true, can_update: true, can_delete: false },
    { resource: 'setting', can_view: true,can_add: false, can_update: false, can_delete: false },
    { resource: 'user_management', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'front_desk', can_view: true ,can_add: true, can_update: true, can_delete: false},
  ],

  waiter: [
    { resource: 'restaurant', can_view: true, can_add: true, can_update: false, can_delete: false },
    { resource: 'dashboard', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'reservation', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'front_desk', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'inventory', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'rooms', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'reports', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'departments', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'user_management', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'procurement', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'setting', can_view: false ,can_add: false, can_update: false, can_delete: false},  
  ],

  inventory_manager: [
    { resource: 'inventory', can_view: true, can_add: true, can_update: true ,can_delete:false},
    { resource: 'procurement', can_view: true ,can_add: false, can_update: false, can_delete: false},
    { resource: 'dashboard', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'reservation', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'front_desk', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'reports', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'rooms', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'restaurant', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'departments', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'user_management', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'setting', can_view: false ,can_add: false, can_update: false, can_delete: false},
  ],

  finance: [
    { resource: 'reports', can_view: true ,can_add: false, can_update: false, can_delete: false},
    { resource: 'dashboard', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'reservation', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'front_desk', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'inventory', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'rooms', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'restaurant', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'departments', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'user_management', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'procurement', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'setting', can_view: false ,can_add: false, can_update: false, can_delete: false},  
  ],

  auditor: [
    { resource: 'reports', can_view: true ,can_add: false, can_update: false, can_delete: false},
    { resource: 'dashboard', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'reservation', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'front_desk', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'inventory', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'rooms', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'restaurant', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'departments', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'user_management', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'procurement', can_view: false ,can_add: false, can_update: false, can_delete: false},
    { resource: 'setting', can_view: false ,can_add: false, can_update: false, can_delete: false},

  ]
};

module.exports = defaultPermissions;
