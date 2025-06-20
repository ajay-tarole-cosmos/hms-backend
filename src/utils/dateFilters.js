const { Op } = require("sequelize");

const getDateFilter = (filterType, startDate, endDate) => {
  const now = new Date();
  let filter = {};

  switch (filterType) {
    case "today":
      filter = {
        [Op.gte]: new Date(now.setHours(0, 0, 0, 0)),
        [Op.lt]: new Date(now.setHours(23, 59, 59, 999)),
      };
      break;
    case "tomorrow":
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      filter = {
        [Op.gte]: new Date(tomorrow.setHours(0, 0, 0, 0)),
        [Op.lt]: new Date(tomorrow.setHours(23, 59, 59, 999)),
      };
      break;
    case "week":
      const weekStart = new Date();
      weekStart.setDate(now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      filter = {
        [Op.gte]: new Date(weekStart.setHours(0, 0, 0, 0)),
        [Op.lt]: new Date(weekEnd.setHours(23, 59, 59, 999)),
      };
      break;
    case "month":
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      filter = {
        [Op.gte]: new Date(monthStart.setHours(0, 0, 0, 0)),
        [Op.lt]: new Date(monthEnd.setHours(23, 59, 59, 999)),
      };
      break;
    case "range":
      if (startDate && endDate) {
        filter = {
          [Op.gte]: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
          [Op.lte]: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
        };
      }
      break;
  }

  return filter;
};

module.exports = { getDateFilter };
