const express = require("express")
const { billingController } = require("../../controllers")
const checkStaffPermission = require("../../middlewares/checkResourcePermission")
const { authenticateUser } = require("../../middlewares/authMiddleware")
const router = express.Router()

// Folio routes
router.post(
    "/folio/reservation/:reservationId",
    authenticateUser,
    checkStaffPermission('reservation', 'view'),
    billingController.getFolioByReservation
  );
  
  router.post(
    "/folio/:folioId",
    authenticateUser,
    checkStaffPermission('reservation', 'view'),
    billingController.getFolioDetails
  );
  
  router.post(
    "/folio/:folioId/charges",
    authenticateUser,
    checkStaffPermission('reservation', 'add'),
    billingController.addChargeToFolio
  );
  
  router.post(
    "/folio/:folioId/generate-invoice",
    authenticateUser,
    checkStaffPermission('reservation', 'add'),
    billingController.generateInvoiceFromFolio
  );

// Invoice routes
router.post(
    "/invoices/:invoiceId",
    authenticateUser,
    checkStaffPermission('reservation', 'view'),
    billingController.getInvoiceDetails
  );
  
  router.post(
    "/invoices/:invoiceId/pdf",
    authenticateUser,
    checkStaffPermission('reservation', 'view'),
    billingController.downloadInvoicePDF
  );
  
  router.post(
    "/invoices/:invoiceId/email",
    authenticateUser,
    checkStaffPermission('reservation', 'view'),
    billingController.emailInvoice
  );

  
// Payment routes
router.post(
    "/payments",
    authenticateUser,
    checkStaffPermission('reservation', 'add'),
    billingController.recordPayment
  );
  
  router.post(
    "/payments/guest/:guestId",
    authenticateUser,
    checkStaffPermission('reservation', 'view'),
    billingController.getGuestPaymentHistory
  );
  
  router.post(
    "/payments/:paymentId/receipt",
    authenticateUser,
    checkStaffPermission('reservation', 'view'),
    billingController.downloadReceiptPDF
  );
  
router.post(
    "/checkout/:reservationId",
    authenticateUser,
    checkStaffPermission('reservation', 'update'),
    billingController.processCheckout
  );
  
module.exports = router


/**
 * @swagger
 * tags:
 *   - name: Billing
 *     description: Billing, Payments, Invoices, and Checkout Operations
 */


/**
 * @swagger
 * /billing/folio/reservation/{reservationId}:
 *   post:
 *     summary: Get folio by reservation ID
 *     tags: [Billing]
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Folio fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */

/**
 * @swagger
 * /billing/folio/{folioId}:
 *   post:
 *     summary: Get folio details by folio ID
 *     tags: [Billing]
 *     parameters:
 *       - in: path
 *         name: folioId
 *         required: true
 *         schema:
 *           type: string
 *         description: Folio ID
 *     responses:
 *       200:
 *         description: Folio details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */

/**
 * @swagger
 * /billing/folio/{folioId}/charges:
 *   post:
 *     summary: Add charge to a folio
 *     tags: [Billing]
 *     parameters:
 *       - in: path
 *         name: folioId
 *         required: true
 *         schema:
 *           type: string
 *         description: Folio ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               charge_type:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               unit_price:
 *                 type: number
 *               charge_date:
 *                 type: string
 *                 format: date-time
 *               is_taxable:
 *                 type: boolean
 *               tax_rate:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Charge added to folio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */

/**
 * @swagger
 * /billing/folio/{folioId}/generate-invoice:
 *   post:
 *     summary: Generate invoice from folio
 *     tags: [Billing]
 *     parameters:
 *       - in: path
 *         name: folioId
 *         required: true
 *         schema:
 *           type: string
 *         description: Folio ID
 *     responses:
 *       201:
 *         description: Invoice generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */

/**
 * @swagger
 * /billing/payments:
 *   post:
 *     summary: Record a payment
 *     tags: [Billing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invoice_id:
 *                 type: string
 *               payment_method:
 *                 type: string
 *                 example: cash
 *               amount:
 *                 type: number
 *               transaction_id:
 *                 type: string
 *               reference_number:
 *                 type: string
 *               payment_date:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 example: completed
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment recorded successfully
 *       404:
 *         description: Invoice not found
 */

/**
 * @swagger
 * /billing/payments/guest/{guestId}:
 *   post:
 *     summary: Get guest's payment history
 *     tags: [Billing]
 *     parameters:
 *       - in: path
 *         name: guestId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of payments
 */

/**
 * @swagger
 * /billing/payments/{paymentId}/receipt:
 *   post:
 *     summary: Download payment receipt PDF
 *     tags: [Billing]
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Receipt downloaded
 *       404:
 *         description: Payment not found
 */

/**
 * @swagger
 * /billing/invoices/{invoiceId}:
 *   post:
 *     summary: Get invoice details
 *     tags: [Billing]
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice retrieved
 *       404:
 *         description: Invoice not found
 */

/**
 * @swagger
 * /billing/invoices/{invoiceId}/pdf:
 *   post:
 *     summary: Download invoice as PDF
 *     tags: [Billing]
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF downloaded
 *       404:
 *         description: Invoice not found
 */

/**
 * @swagger
 * /billing/invoices/{invoiceId}/email:
 *   post:
 *     summary: Email invoice to guest
 *     tags: [Billing]
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice emailed
 *       404:
 *         description: Invoice not found
 */

/**
 * @swagger
 * /billing/checkout/{reservationId}:
 *   post:
 *     summary: Process guest checkout
 *     tags: [Billing]
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Checkout processed and invoice generated
 *       400:
 *         description: Reservation not found or error during checkout
 */
