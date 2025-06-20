const httpStatus = require('http-status');
const { Procurement, ProcurementItem, ProcurementRequest, ProcurementRequestItem, Department, DepartmentCategory, InventoryItem } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a procurement when items are received
 * @param {UUID} requestId - ID of the approved request
 * @param {Object} receivedData - Data about received items
 * @returns {Promise<Procurement>}
 */
const createProcurementFromRequest = async (requestId, receivedData) => {
  const request = await ProcurementRequest.findByPk(requestId, {
    include: [
      {
        model: ProcurementRequestItem,
        as: 'items',
        include: [{
          model: InventoryItem,
          as: 'item'
        }]
      }
    ]
  });

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }

  if (request.status !== 'approved') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Can only create procurement from approved requests');
  }

  // Calculate total amount from request items
  const totalAmount = request.items.reduce((sum, item) => {
    return sum + (item.quantity * (item.estimated_cost || 0));
  }, 0);

  // Create procurement record
  const procurement = await Procurement.create({
    department_id: request.department_id,
    category_id: request.category_id,
    request_id: request.id,
    total_amount: totalAmount,
    received_by: receivedData.received_by,
    reason: receivedData.reason,
    status: 'received'
  });

  // Create procurement items from request items
  const procurementItems = request.items.map(item => ({
    procurement_id: procurement.id,
    item_id: item.item_id,
    quantity: item.quantity,
    unit_price: item.estimated_cost || 0,
    total_price: item.quantity * (item.estimated_cost || 0),
    reason: item.purpose // Using purpose from request item as reason
  }));

  await ProcurementItem.bulkCreate(procurementItems);

  // Update request status to indicate it's been processed
  await request.update({ status: 'completed' });

  return getProcurementById(procurement.id);
};

/**
 * Get procurement by id
 * @param {UUID} id
 * @returns {Promise<Procurement>}
 */
const getProcurementById = async (id) => {
  return Procurement.findByPk(id, {
    include: [
      {
        model: ProcurementItem,
        as: 'items',
        include: [{
          model: InventoryItem,
          as: 'item'
        }]
      },
      {
        model: Department,
        as: 'department'
      },
      {
        model: DepartmentCategory,
        as: 'category'
      },
      {
        model: ProcurementRequest,
        as: 'request'
      }
    ]
  });
};

/**
 * Query procurements
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryProcurements = async (filter, options) => {
  const procurements = await Procurement.findAndCountAll({
    where: filter,
    include: [
      {
        model: ProcurementItem,
        as: 'items',
        include: [{
          model: InventoryItem,
          as: 'item'
        }]
      },
      {
        model: Department,
        as: 'department'
      },
      {
        model: DepartmentCategory,
        as: 'category'
      },
      {
        model: ProcurementRequest,
        as: 'request'
      }
    ],
    limit: options.limit,
    offset: (options.page - 1) * options.limit,
    order: options.sortBy || [['created_at', 'DESC']],
  });

  return {
    data: procurements.rows,
    pagination: {
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(procurements.count / options.limit),
      totalResults: procurements.count,
    }
  };
};

/**
 * Mark procurement as completed
 * @param {UUID} id
 * @param {Object} completionData
 * @returns {Promise<Procurement>}
 */
const completeProcurement = async (id, completionData) => {
  const procurement = await getProcurementById(id);
  if (!procurement) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Procurement not found');
  }

  if (procurement.status !== 'received') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Can only complete received procurements');
  }

  procurement.status = 'completed';
  if (completionData.reason) {
    procurement.reason = completionData.reason;
  }

  await procurement.save();
  return getProcurementById(id);
};

module.exports = {
  createProcurementFromRequest,
  getProcurementById,
  queryProcurements,
  completeProcurement,
};
