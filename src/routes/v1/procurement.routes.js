const express = require('express');
// const auth = require('../../middlewares/auth');
// const validate = require('../../middlewares/validate');
// const procurementValidation = require('../../validations/procurement.validation');
const procurementController = require('../../controllers/procurement.controller');
const upload = require('../../middlewares/upload');

const router = express.Router();

// Procurement Routes
// router
//   .route('/')
//   .post(auth('manageProcurements'), validate(procurementValidation.createProcurement), procurementController.createProcurement)
//   .get(auth('getProcurements'), validate(procurementValidation.getProcurements), procurementController.getProcurements);

// router
//   .route('/:procurementId')
//   .get(auth('getProcurements'), validate(procurementValidation.getProcurement), procurementController.getProcurement)
//   .patch(auth('manageProcurements'), validate(procurementValidation.updateProcurement), procurementController.updateProcurement)
//   .delete(auth('manageProcurements'), validate(procurementValidation.deleteProcurement), procurementController.deleteProcurement);

// // Upload Invoice/Bill
// router
//   .route('/:procurementId/invoice')
//   .post(auth('manageProcurements'), validate(procurementValidation.uploadInvoice), procurementController.uploadInvoice);

// // Procurement Request Routes
// router
//   .route('/requests')
//   .post(auth('createRequests'), validate(procurementValidation.createRequest), procurementController.createRequest)
//   .get(auth('getRequests'), validate(procurementValidation.getRequests), procurementController.getRequests);

// router
//   .route('/requests/:requestId')
//   .get(auth('getRequests'), validate(procurementValidation.getRequest), procurementController.getRequest)
//   .patch(auth('manageRequests'), validate(procurementValidation.updateRequest), procurementController.updateRequest)
//   .delete(auth('manageRequests'), validate(procurementValidation.deleteRequest), procurementController.deleteRequest);

// // Request Approval Routes
// router
//   .route('/requests/:requestId/approve')
//   .post(auth('approveRequests'), validate(procurementValidation.approveRequest), procurementController.approveRequest);

// router
//   .route('/requests/:requestId/reject')
//   .post(auth('approveRequests'), validate(procurementValidation.rejectRequest), procurementController.rejectRequest);

// Procurement Request Routes
router.post('/requests/create', procurementController.createRequest);
router.post('/requests/all', procurementController.getRequests);
router.put('/requests/:requestId', procurementController.updateRequest);
router.delete('/requests/:requestId', procurementController.deleteRequest);

// Invoice file management routes
router.put('/requests/:requestId/invoice-files', upload.fields([
  { name: 'invoice_files', maxCount: 5 }
]), procurementController.updateInvoiceFiles);

router.put('/requests/:requestId/upload-invoice', upload.fields([
  { name: 'invoice_files', maxCount: 5 }
]), procurementController.uploadInvoice);

// Remove the old procurement routes since we're handling everything through requests
// router.post('/receive/create/:requestId', procurementController.createProcurementFromRequest);
// router.post('/received/all', procurementController.getProcurements);
// router.post('/received/:id', procurementController.getProcurementById);
// router.post('/received/:id/complete', procurementController.completeProcurement);

module.exports = router;
