const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createProcurement = {
  body: Joi.object().keys({
    departmentId: Joi.string().custom(objectId).required(),
    categoryId: Joi.string().custom(objectId).required(),
    items: Joi.array().items(
      Joi.object().keys({
        itemId: Joi.string().custom(objectId).required(),
        quantity: Joi.number().integer().min(1).required(),
        unitPrice: Joi.number().min(0).required(),
        totalPrice: Joi.number().min(0).required(),
      })
    ).required(),
    totalAmount: Joi.number().min(0).required(),
    expectedDeliveryDate: Joi.date().iso().required(),
    reason: Joi.string(),
  }),
};

const getProcurements = {
  query: Joi.object().keys({
    departmentId: Joi.string().custom(objectId),
    categoryId: Joi.string().custom(objectId),
    status: Joi.string().valid('pending', 'approved', 'rejected', 'completed'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getProcurement = {
  params: Joi.object().keys({
    procurementId: Joi.string().custom(objectId).required(),
  }),
};

const updateProcurement = {
  params: Joi.object().keys({
    procurementId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      departmentId: Joi.string().custom(objectId),
      categoryId: Joi.string().custom(objectId),
      items: Joi.array().items(
        Joi.object().keys({
          itemId: Joi.string().custom(objectId),
          quantity: Joi.number().integer().min(1),
          unitPrice: Joi.number().min(0),
          totalPrice: Joi.number().min(0),
        })
      ),
      totalAmount: Joi.number().min(0),
      expectedDeliveryDate: Joi.date().iso(),
      reason: Joi.string(),
      status: Joi.string().valid('pending', 'approved', 'rejected', 'completed'),
    })
    .min(1),
};

const deleteProcurement = {
  params: Joi.object().keys({
    procurementId: Joi.string().custom(objectId).required(),
  }),
};

const uploadInvoice = {
  params: Joi.object().keys({
    // procurementId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    // invoiceNumber: Joi.string().required(),
    // invoiceDate: Joi.date().iso().required(),
    // amount: Joi.number().min(0).required(),
    // paymentStatus: Joi.string().valid('pending', 'paid').required(),
  }),
};

// Request Validations
const createRequest = {
  body: Joi.object().keys({
    departmentId: Joi.string().custom(objectId).required(),
    categoryId: Joi.string().custom(objectId).required(),
    items: Joi.array().items(
      Joi.object().keys({
        itemId: Joi.string().custom(objectId).required(),
        quantity: Joi.number().integer().min(1).required(),
        purpose: Joi.string().required(),
      })
    ).required(),
    priority: Joi.string().valid('low', 'medium', 'high').required(),
    requiredBy: Joi.date().iso().required(),
    justification: Joi.string().required(),
    invoice_number: Joi.string(),
    invoice_date: Joi.date().iso(),
    invoice_amount: Joi.number().min(0),
    // invoice_file: Joi.string(),
    // payment_status: Joi.string().valid('pending', 'paid'),
  }),
};

const getRequests = {
  query: Joi.object().keys({
    departmentId: Joi.string().custom(objectId),
    categoryId: Joi.string().custom(objectId),
    status: Joi.string().valid('pending', 'approved', 'rejected'),
    priority: Joi.string().valid('low', 'medium', 'high'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getRequest = {
  params: Joi.object().keys({
    requestId: Joi.string().custom(objectId).required(),
  }),
};

const updateRequest = {
  params: Joi.object().keys({
    requestId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      departmentId: Joi.string().custom(objectId),
      categoryId: Joi.string().custom(objectId),
      items: Joi.array().items(
        Joi.object().keys({
          itemId: Joi.string().custom(objectId),
          quantity: Joi.number().integer().min(1),
          purpose: Joi.string(),
        })
      ),
      priority: Joi.string().valid('low', 'medium', 'high'),
      requiredBy: Joi.date().iso(),
      justification: Joi.string(),
      status: Joi.string().valid('pending', 'approved', 'rejected'),
    })
    .min(1),
};

const deleteRequest = {
  params: Joi.object().keys({
    requestId: Joi.string().custom(objectId).required(),
  }),
};

const approveRequest = {
  params: Joi.object().keys({
    requestId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    comments: Joi.string(),
  }),
};

const rejectRequest = {
  params: Joi.object().keys({
    requestId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    reason: Joi.string().required(),
  }),
};

module.exports = {
  createProcurement,
  getProcurements,
  getProcurement,
  updateProcurement,
  deleteProcurement,
  uploadInvoice,
  createRequest,
  getRequests,
  getRequest,
  updateRequest,
  deleteRequest,
  approveRequest,
  rejectRequest,
}; 