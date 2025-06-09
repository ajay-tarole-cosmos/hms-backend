const express = require('express');
const guestRoute = require('../v1/user.route');
const docsRoute = require('./docs.route');
const config = require('../../config/config');
const roomRoute = require('../v1/room.route');
const roomReservationRoute = require('../v1/roomReservation.route')
const hotelRoute= require('./hotel.route');
const serviceRoute = require('./service.route');
const billingRoute = require('./billing.routes');
const categoryRoutes = require('../v1/category.routes');
const subcategoryRoutes = require('../v1/subcategory.routes');
const variantRoutes = require('../v1/variant.routes');
const restaurantTableRoutes = require('./restaurant_table.routes');
const tableBookingRoutes = require('./tableBooking.routes');
const restaurantOrderRoutes = require('./restaurant_order.routes');
const authRoute = require('./auth.route');

const departmentRoutes = require('./department.routes');
const departmentCategoryRoutes = require('./deparment_category.routes');
const inventoryItemRoutes = require('./inventoryItem.routes');
const router = express.Router();

const defaultRoutes = [
  {
    path: '/guest',
    route: guestRoute
  },
  {
    path: '/room',
    route: roomRoute
  },
  {
    path:'/reservation',
    route:roomReservationRoute
  },
  {
    path:'/hotel',
    route:hotelRoute
  },
  {
    path:'/service',
    route:serviceRoute
  },
  {
    path:'/billing',
    route:billingRoute
  },
  {
    path:'/categories',
    route:categoryRoutes
  },
  {
    path:"/subcategories",
    route:subcategoryRoutes
  },
  {
    path:"/variant",
    route:variantRoutes
  },
  {
    path: '/auth',
    route: authRoute
  },
  {
    path:"/departments",
    route:departmentRoutes
  },
  {
    path:"/department-categories",
    route:departmentCategoryRoutes
  },
  {
    path:"/department-inventories",
    route:inventoryItemRoutes
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

router.use(restaurantTableRoutes);
router.use(tableBookingRoutes);
router.use(restaurantOrderRoutes);

module.exports = router;
