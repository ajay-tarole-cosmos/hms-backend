const { InventoryConsumptionHistory, InventoryItem, Department, DepartmentCategory } = require('../models');
const { Op } = require('sequelize');

/**
 * Generate inventory consumption report
 * @param {Object} filter - Filter criteria
 * @param {Date} filter.startDate - Start date for the report
 * @param {Date} filter.endDate - End date for the report
 * @param {UUID} filter.departmentId - Department ID to filter by
 * @param {UUID} filter.categoryId - Category ID to filter by
 * @param {UUID} filter.itemId - Item ID to filter by
 * @param {string} filter.sourceType - Source type to filter by (procurement/manual/consumption)
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const generateConsumptionReport = async (filter = {}, options = {}) => {
  try {
    const whereClause = {};
    const itemWhereClause = {};

    // Add date range filter
    if (filter.startDate && filter.endDate) {
      whereClause.created_at = {
        [Op.between]: [filter.startDate, filter.endDate]
      };
    }

    // Add source type filter
    if (filter.sourceType) {
      whereClause.source_type = filter.sourceType;
    }

    // Add department and category filters to item where clause
    if (filter.departmentId) {
      itemWhereClause.department_id = filter.departmentId;
    }
    if (filter.categoryId) {
      itemWhereClause.category_id = filter.categoryId;
    }
    if (filter.itemId) {
      whereClause.item_id = filter.itemId;
    }

    // Get consumption history with related data
    const consumptionHistory = await InventoryConsumptionHistory.findAll({
      where: whereClause,
      include: [
        {
          model: InventoryItem,
          as: 'item',
          where: itemWhereClause,
          include: [
            {
              model: Department,
              as: 'department'
            },
            {
              model: DepartmentCategory,
              as: 'category'
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      ...options
    });

    // Calculate summary statistics
    const summary = consumptionHistory.reduce((acc, record) => {
      const changeAmount = record.change_amount;
      if (record.change_type === 'increase') {
        acc.totalIncrease += changeAmount;
        if (record.source_type === 'procurement') {
          acc.totalProcurement += changeAmount;
        }
      } else {
        acc.totalDecrease += changeAmount;
      }
      return acc;
    }, {
      totalIncrease: 0,
      totalDecrease: 0,
      totalProcurement: 0
    });

    // Group by item
    const itemWiseConsumption = consumptionHistory.reduce((acc, record) => {
      const itemId = record.item_id;
      if (!acc[itemId]) {
        acc[itemId] = {
          item: record.item,
          totalIncrease: 0,
          totalDecrease: 0,
          totalProcurement: 0,
          history: []
        };
      }

      if (record.change_type === 'increase') {
        acc[itemId].totalIncrease += record.change_amount;
      } else {
        acc[itemId].totalDecrease += record.change_amount;
      }
      if(record.source_type === 'procurement'){
        acc[itemId].totalProcurement += record.change_amount;
      }

      acc[itemId].history.push(record);
      return acc;
    }, {});

    return {
      summary,
      itemWiseConsumption: Object.values(itemWiseConsumption),
      rawHistory: consumptionHistory
    };
  } catch (error) {
    console.error('Error generating consumption report:', error);
    // Return empty report if table doesn't exist or other errors
    return {
      summary: {
        totalIncrease: 0,
        totalDecrease: 0,
        totalProcurement: 0
      },
      itemWiseConsumption: [],
      rawHistory: [],
      error: error.message
    };
  }
};

module.exports = {
  generateConsumptionReport
}; 