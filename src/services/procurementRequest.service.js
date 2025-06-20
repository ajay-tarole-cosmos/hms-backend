const httpStatus = require('http-status');
const { ProcurementRequest, ProcurementRequestItem } = require('../models');
const ApiError = require('../utils/ApiError');
const Department = require('../models/departments.model');
const DepartmentCategory = require('../models/department_category.model');
const InventoryItem = require('../models/department_inventoryitem.model');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a procurement request
 * @param {Object} requestBody
 * @returns {Promise<ProcurementRequest>}
 */
const createRequest = async (requestBody) => {
  const { items, ...requestData } = requestBody;

  // Create the request first
  const request = await ProcurementRequest.create(requestData);

  // If there are items, create them
  if (items && items.length > 0) {
    const requestItems = items.map(item => ({
      ...item,
      procurement_request_id: request.id
    }));

    await ProcurementRequestItem.bulkCreate(requestItems);
  }

  // Return the request with its items
  return getRequestById(request.id);
};

/**
 * Query procurement requests
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryRequests = async (filter, options) => {
  const requests = await ProcurementRequest.findAndCountAll({
    where: filter,
    include: [
      {
        model: ProcurementRequestItem,
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
      }
    ],
    limit: options.limit,
    offset: (options.page - 1) * options.limit,
    order: options.sortBy ? [options.sortBy] : undefined,
  });

  return {
    data: requests.rows,
    pagination: {
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(requests.count / options.limit),
      totalResults: requests.count,
    }
  };
};

/**
 * Get request by id
 * @param {ObjectId} id
 * @returns {Promise<ProcurementRequest>}
 */
const getRequestById = async (id) => {
  return ProcurementRequest.findByPk(id, {
    include: [
      {
        model: ProcurementRequestItem,
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
      }
    ]
  });
};

/**
 * Update request by id
 * @param {ObjectId} requestId
 * @param {Object} updateBody
 * @returns {Promise<ProcurementRequest>}
 */
const updateRequestById = async (requestId, updateBody, bodyData) => {
  const request = await getRequestById(requestId);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }

  console.log('updateBody', updateBody);

  // Handle invoice file management
  if (updateBody.updateType === 'edit_documents') {
    console.log('Processing edit_documents update for invoice files');
    
    const existingFiles = request.invoice_files || [];
    console.log('Existing invoice files:', existingFiles);

    // Parse documentsToDelete if it's a string
    const documentsToDelete = typeof updateBody.documentsToDelete === 'string' 
      ? JSON.parse(updateBody.documentsToDelete) 
      : updateBody.documentsToDelete;

    console.log('Invoice files to delete:', documentsToDelete);

    // Remove invoice files that are marked for deletion
    const updatedFiles = existingFiles.filter((file, index) => {
      const shouldKeep = !documentsToDelete.includes(index);
      console.log(`Invoice file ${index}: ${shouldKeep ? 'keeping' : 'deleting'}`);
      return shouldKeep;
    });

    console.log('Invoice files after deletion:', {
      originalCount: existingFiles.length,
      deletedCount: documentsToDelete.length,
      remainingCount: updatedFiles.length,
      remainingFiles: updatedFiles
    });

    // Update the invoice_files with the filtered list
    updateBody.invoice_files = updatedFiles;
  }

  // Handle new invoice file uploads
  if (updateBody.updateType === 'upload_files') {
    console.log('Processing upload_files update for invoice files');
    
    const existingFiles = request.invoice_files || [];
    const newFiles = updateBody.invoice_files || [];
    
    console.log('Existing invoice files count:', existingFiles.length);
    console.log('New invoice files count:', newFiles.length);

    // Combine existing and new files
    const combinedFiles = [...existingFiles, ...newFiles];
    
    console.log('Combined invoice files:', combinedFiles);
    
    updateBody.invoice_files = combinedFiles;
  }

  // Handle initial invoice upload (replace all files)
  if (updateBody.updateType === 'initial_upload') {
    console.log('Processing initial_upload update for invoice files');
    
    const newFiles = updateBody.invoice_files || [];
    console.log('New invoice files for initial upload:', newFiles);
    
    updateBody.invoice_files = newFiles;
  }

  // Only check status for non-invoice updates
  if (request.status !== 'pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Can only update pending requests');
  }

  // Handle items update if items are provided
  if (bodyData?.items && bodyData?.items?.length > 0) {
    console.log('Processing items update');
    
    // Delete existing items
    await ProcurementRequestItem.destroy({
      where: { procurement_request_id: requestId }
    });

    // Create new items with only necessary fields
    const requestItems = bodyData.items.map(item => ({
      id: uuidv4(), // Generate new UUID for each item
      procurement_request_id: requestId,
      item_id: item.item_id,
      quantity: item.quantity,
      purpose: item.purpose,
      estimated_cost: item.estimated_cost,
      notes: item.notes
    }));

    await ProcurementRequestItem.bulkCreate(requestItems);
    
    // Remove items from bodyData since we've handled them separately
    delete bodyData.items;
  }

  // If status is being updated to approved, add items to inventory
  if (updateBody.status === 'approved') {
    // Get all items from the request
    const requestItems = await ProcurementRequestItem.findAll({
      where: { procurement_request_id: requestId },
      include: [{
        model: InventoryItem,
        as: 'item'
      }]
    });

    // Update inventory for each item
    for (const requestItem of requestItems) {
      const inventoryItem = await InventoryItem.findByPk(requestItem.item_id);
      if (inventoryItem) {
        const newQuantity = inventoryItem.quantity + parseInt(requestItem.quantity);
        const notes = `Procurement request #${requestId} approved - Item quantity increased by ${requestItem.quantity}`;
        
        // Update existing inventory item quantity with detailed source information
        await inventoryItem.update(
          { quantity: newQuantity },
          {
            sourceType: 'procurement',
            sourceId: requestId,
            notes: notes,
            metadata: {
              requestId: requestId,
              itemId: requestItem.item_id,
              previousQuantity: inventoryItem.quantity,
              changeAmount: requestItem.quantity,
              purpose: requestItem.purpose || 'Procurement request approval',
              invoiceNumber: request.invoice_number,
              invoiceDate: request.invoice_date
            }
          }
        );
      }
    }
  }

  console.log('Final updateBody:', updateBody);
  
  // Update request details
  Object.assign(request, updateBody);
  await request.save();

  // Return updated request with items
  return getRequestById(requestId);
};

/**
 * Delete request by id
 * @param {ObjectId} requestId
 * @returns {Promise<ProcurementRequest>}
 */
const deleteRequestById = async (requestId) => {
  const request = await getRequestById(requestId);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  
  // Allow deletion of requests in any status
  console.log('Deleting request:', requestId);
  
  await request.destroy();
  return { message: 'Request deleted successfully' };
};

/**
 * Approve request
 * @param {ObjectId} requestId
 * @param {Object} approvalData
 * @returns {Promise<ProcurementRequest>}
 */
const approveRequest = async (requestId, { approved_by, reason }) => {
  const request = await getRequestById(requestId);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }

  if (request.status !== 'pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Request is not in pending status');
  }

  // Update request status
  await request.update({
    status: 'approved',
    approved_by,
    approved_at: new Date(),
    comments: reason
  });

  // If invoice is provided, update inventory
  if (request.invoice_number && request.invoice_file) {
    // Add items to inventory
    for (const item of request.items) {
      const inventoryItem = await InventoryItem.findByPk(item.item_id);
      if (inventoryItem) {
        // Update existing inventory item
        await inventoryItem.update({
          quantity: inventoryItem.quantity + item.quantity
        });
      }
    }
  }

  return getRequestById(requestId);
};

/**
 * Reject request
 * @param {ObjectId} requestId
 * @param {Object} rejectionData
 * @returns {Promise<ProcurementRequest>}
 */
const rejectRequest = async (requestId, rejectionData) => {
  const request = await getRequestById(requestId);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  if (request.status !== 'pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Can only reject pending requests');
  }

  Object.assign(request, {
    status: 'rejected',
    approvedBy: rejectionData.approvedBy,
    approvedAt: new Date(),
    rejectionReason: rejectionData.rejectionReason,
  });

  await request.save();
  return request;
};

module.exports = {
  createRequest,
  queryRequests,
  getRequestById,
  updateRequestById,
  deleteRequestById,
  approveRequest,
  rejectRequest,
}; 