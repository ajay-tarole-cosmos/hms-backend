const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { procurementRequestService, procurementService } = require('../services');
const ApiError = require('../utils/ApiError');

// Request Controllers
const createRequest = catchAsync(async (req, res) => {
  const request = await procurementRequestService.createRequest(req.body);
  res.status(httpStatus.CREATED).send(request);
});

const getRequests = catchAsync(async (req, res) => {
  const filter = {
    ...(req.query.department_id && { department_id: req.query.department_id }),
    ...(req.query.category_id && { category_id: req.query.category_id }),
    ...(req.query.status && { status: req.query.status }),
  };
  const options = {
    limit: parseInt(req.query.limit, 10) || 10,
    page: parseInt(req.query.page, 10) || 1,
    sortBy: req.query.sortBy || [["created_at", "desc"]],
  };
  const result = await procurementRequestService.queryRequests(filter, options);
  res.send(result);
});

const updateRequest = catchAsync(async (req, res) => {
  console.log('Update request received:', {
    requestId: req.params.requestId,
    body: req.body,
    updateType: req.body.updateType
  });
  
  const request = await procurementRequestService.updateRequestById(req.params.requestId, req.body);
  res.send(request);
});

const deleteRequest = catchAsync(async (req, res) => {
  console.log('Delete request received:', {
    requestId: req.params.requestId
  });
  
  const result = await procurementRequestService.deleteRequestById(req.params.requestId);
  res.send(result);
});

const updateDocuments = catchAsync(async (req, res) => {
  console.log('Update documents request received:', {
    requestId: req.params.requestId,
    body: req.body,
    files: req.files
  });

  try {
    const request = await procurementRequestService.getRequestById(req.params.requestId);
    if (!request) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Procurement request not found');
    }

    let updateData = {};

    // Handle different update types
    if (req.body.updateType === 'edit_documents') {
      // Handle document deletion
      const existingFiles = request.invoice_files || [];
      const documentsToDelete = typeof req.body.documentsToDelete === 'string' 
        ? JSON.parse(req.body.documentsToDelete) 
        : req.body.documentsToDelete;

      const updatedFiles = existingFiles.filter((file, index) => !documentsToDelete.includes(index));
      updateData.invoice_files = updatedFiles;

    } else if (req.body.updateType === 'upload_files') {
      // Handle new file uploads
      if (!req.files || req.files.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'At least one file is required for upload');
      }

      const existingFiles = request.invoice_files || [];
      const newFiles = req.files.map(file => ({
        path: file.path,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploaded_at: new Date()
      }));

      updateData.invoice_files = [...existingFiles, ...newFiles];

    } else if (req.body.updateType === 'initial_upload') {
      // Handle initial upload (replace all files)
      if (!req.files || req.files.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'At least one file is required for initial upload');
      }

      const newFiles = req.files.map(file => ({
        path: file.path,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploaded_at: new Date()
      }));

      updateData.invoice_files = newFiles;
    }

    // Add other fields if provided
    if (req.body.invoice_number) updateData.invoice_number = req.body.invoice_number;
    if (req.body.invoice_date) updateData.invoice_date = req.body.invoice_date;
    if (req.body.invoice_amount) updateData.invoice_amount = req.body.invoice_amount;

    console.log('Updating request with data:', updateData);

    const updatedRequest = await procurementRequestService.updateRequestById(req.params.requestId, updateData);

    res.send(updatedRequest);
  } catch (error) {
    console.error('Error in updateDocuments:', error);
    throw error;
  }
});

const updateInvoiceFiles = catchAsync(async (req, res) => {
  console.log('Update invoice files request received:', {
    requestId: req.params.requestId,
    body: req.body,
    files: req.files
  });

  try {
    const request = await procurementRequestService.getRequestById(req.params.requestId);
    if (!request) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Procurement request not found');
    }

    let updateData = {};

    // Handle different update types for invoice files
    if (req.body.updateType === 'edit_documents') {
      // Handle invoice file deletion
      const existingFiles = request.invoice_files || [];
      const documentsToDelete = typeof req.body.documentsToDelete === 'string' 
        ? JSON.parse(req.body.documentsToDelete) 
        : req.body.documentsToDelete;

      const updatedFiles = existingFiles.filter((file, index) => !documentsToDelete.includes(index));
      updateData.invoice_files = updatedFiles;

    } else if (req.body.updateType === 'upload_files') {
      // Handle new invoice file uploads
      if (!req.files || req.files.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'At least one invoice file is required for upload');
      }

      const existingFiles = request.invoice_files || [];
      const newFiles = req.files.map(file => ({
        path: file.path,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploaded_at: new Date()
      }));

      updateData.invoice_files = [...existingFiles, ...newFiles];

    } else if (req.body.updateType === 'initial_upload') {
      // Handle initial invoice upload (replace all files)
      if (!req.files || req.files.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'At least one invoice file is required for initial upload');
      }

      const newFiles = req.files.map(file => ({
        path: file.path,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploaded_at: new Date()
      }));

      updateData.invoice_files = newFiles;
    }

    // Add other invoice fields if provided
    if (req.body.invoice_number) updateData.invoice_number = req.body.invoice_number;
    if (req.body.invoice_date) updateData.invoice_date = req.body.invoice_date;
    if (req.body.invoice_amount) updateData.invoice_amount = req.body.invoice_amount;

    console.log('Updating request with invoice data:', updateData);

    const updatedRequest = await procurementRequestService.updateRequestById(req.params.requestId, updateData,req.body);

    res.send(updatedRequest);
  } catch (error) {
    console.error('Error in updateInvoiceFiles:', error);
    throw error;
  }
});

const uploadInvoice = catchAsync(async (req, res) => {
  try {
    console.log('Upload invoice request received:', {
      requestId: req.params.requestId,
      files: req.files,
      uploadType: req.body.uploadType,
      fileMetadata: req.body.fileMetadata
    });

    if (!req.files || req.files.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'At least one invoice file is required');
    }

    if (req.files.length > 5) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Maximum 5 files allowed');
    }

    // Get existing files or initialize empty array
    const request = await procurementRequestService.getRequestById(req.params.requestId);
    if (!request) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Procurement request not found');
    }

    const existingFiles = request.invoice_files || [];
    
    // If it's initial upload, replace existing files
    // Otherwise, append new files
    let updatedFiles;
    if (req.body.uploadType === 'initial_upload') {
      updatedFiles = [];
    } else {
      updatedFiles = [...existingFiles];
    }

    // Parse fileMetadata if it's a string
    const fileMetadata = typeof req.body.fileMetadata === 'string' 
      ? JSON.parse(req.body.fileMetadata) 
      : req.body.fileMetadata;

      console.log('\n',req.files,)
    // Create file objects with metadata
    const newFiles = req?.files?.invoice_files?.map((file, index) => {
      const metadata = fileMetadata[index] || {};
      return {
        path: file.path,
        filename: metadata.fileName || file.originalname,
        mimetype: metadata.fileType || file.mimetype,
        size: metadata.fileSize || file.size,
        uploaded_at: new Date()
      };
    });

    const updateData = {
      invoice_files: [...updatedFiles, ...newFiles]
    };

    // Only add these fields if they are provided
    if (req.body.invoice_number) updateData.invoice_number = req.body.invoice_number;
    if (req.body.invoice_date) updateData.invoice_date = req.body.invoice_date;
    if (req.body.invoice_amount) updateData.invoice_amount = req.body.invoice_amount;

    console.log('Updating request with data:', updateData);

    const updatedRequest = await procurementRequestService.updateRequestById(req.params.requestId, updateData);

    console.log('Request updated successfully:', {
      requestId: updatedRequest.id,
      invoiceFiles: updatedRequest.invoice_files
    });

    res.send(updatedRequest);
  } catch (error) {
    console.error('Error in uploadInvoice:', {
      error: error.message,
      stack: error.stack,
      requestId: req.params.requestId
    });
    throw error;
  }
});

const approveRequest = catchAsync(async (req, res) => {
  const request = await procurementRequestService.approveRequest(req.params.requestId, {
    approved_by: req.body.approved_by,
    reason: req.body.reason,
  });
  res.send(request);
});

const rejectRequest = catchAsync(async (req, res) => {
  const request = await procurementRequestService.rejectRequest(req.params.requestId, {
    approved_by: req.body.approved_by,
    rejection_reason: req.body.rejection_reason,
  });
  res.send(request);
});

// Remove old procurement controllers since we're handling everything through requests
// const createProcurementFromRequest = catchAsync(async (req, res) => {
//   const procurement = await procurementService.createProcurementFromRequest(req.params.requestId, {
//     received_by: req.body.received_by || "293d7f14-26d0-405f-8bd1-7bf1ab25e697",
//     reason: req.body.reason,
//   });
//   res.status(httpStatus.CREATED).send(procurement);
// });

// const getProcurements = catchAsync(async (req, res) => {
//   const filter = {
//     ...(req.query.department_id && { department_id: req.query.department_id }),
//     ...(req.query.category_id && { category_id: req.query.category_id }),
//     ...(req.query.status && { status: req.query.status }),
//   };
//   const options = {
//     limit: parseInt(req.query.limit, 10) || 10,
//     page: parseInt(req.query.page, 10) || 1,
//     sortBy: req.query.sortBy || [["created_at", "desc"]],
//   };
//   const result = await procurementService.queryProcurements(filter, options);
//   res.send(result);
// });

// const getProcurementById = catchAsync(async (req, res) => {
//   const procurement = await procurementService.getProcurementById(req.params.id);
//   if (!procurement) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Procurement not found');
//   }
//   res.send(procurement);
// });

// const completeProcurement = catchAsync(async (req, res) => {
//   const procurement = await procurementService.completeProcurement(req.params.id, {
//     reason: req.body.reason,
//   });
//   res.send(procurement);
// });

module.exports = {
  // Request Controllers
  createRequest,
  getRequests,
  updateRequest,
  deleteRequest,
  updateDocuments,
  updateInvoiceFiles,
  uploadInvoice,
  approveRequest,
  rejectRequest,
  
  // Remove old procurement controllers
  // createProcurementFromRequest,
  // getProcurements,
  // getProcurementById,
  // completeProcurement,
};
