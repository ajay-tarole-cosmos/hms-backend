// const httpStatus = require("http-status")
// const catchAsync = require("../utils/catchAsync")
// const { pdfService, emailService, billingService } = require("../services")
// const path = require("path")
// const fs = require("fs")
// const { Payments,Guests,Invoice} = require("../models")

// const getFolioByReservation = catchAsync(async (req, res) => {
//   const { reservationId } = req.params
//   const folio = await billingService.getFolioByReservation(reservationId)

//   res.status(httpStatus.OK).json({
//     success: true,
//     data: folio,
//   })
// })

// const getFolioDetails = catchAsync(async (req, res) => {
//   const { folioId } = req.params
//   const folio = await billingService.getFolioDetails(folioId)

//   res.status(httpStatus.OK).json({
//     success: true,
//     data: folio,
//   })
// })

// const addChargeToFolio = catchAsync(async (req, res) => {
//   const { folioId } = req.params
//   const charge = await billingService.addChargeToFolio(folioId, req.body, req.user.id='215cd88a-b951-44ac-a865-c51d497c28b4')

//   res.status(httpStatus.CREATED).json({
//     success: true,
//     message: "Charge added successfully",
//     data: charge,
//   })
// })

// const generateInvoiceFromFolio = catchAsync(async (req, res) => {
//   const { folioId } = req.params
//   const invoice = await billingService.generateInvoiceFromFolio(folioId, req.user?.id)

//   res.status(httpStatus.CREATED).json({
//     success: true,
//     message: "Invoice generated successfully",
//     data: invoice,
//   })
// })

// const getInvoiceDetails = catchAsync(async (req, res) => {
//   const { invoiceId } = req.params
//   const invoice = await billingService.getInvoiceDetails(invoiceId)

//   res.status(httpStatus.OK).json({
//     success: true,
//     data: invoice,
//   })
// })

// const downloadInvoicePDF = catchAsync(async (req, res) => {
//   const { invoiceId } = req.params
//   const invoice = await billingService.getInvoiceDetails(invoiceId)

//   const fileName = `invoice-${invoice.invoice_number}.pdf`
//   const filePath = path.join(__dirname, "../temp", fileName)

//   // Ensure temp directory exists
//   const tempDir = path.dirname(filePath)
//   if (!fs.existsSync(tempDir)) {
//     fs.mkdirSync(tempDir, { recursive: true })
//   }

//   await pdfService.generateInvoicePDF(invoice, filePath)

//   res.download(filePath, fileName, (err) => {
//     if (err) {
//       console.error("Error downloading file:", err)
//     }
//     // Clean up temp file
//     fs.unlink(filePath, (unlinkErr) => {
//       if (unlinkErr) console.error("Error deleting temp file:", unlinkErr)
//     })
//   })
// })

// const emailInvoice = catchAsync(async (req, res) => {
//   const { invoiceId } = req.params
//   const invoice = await billingService.getInvoiceDetails(invoiceId)

//   const fileName = `invoice-${invoice.invoice_number}.pdf`
//   const filePath = path.join(__dirname, "../temp", fileName)

//   // Ensure temp directory exists
//   const tempDir = path.dirname(filePath)
//   if (!fs.existsSync(tempDir)) {
//     fs.mkdirSync(tempDir, { recursive: true })
//   }

//   await pdfService.generateInvoicePDF(invoice, filePath)
//   await emailService.sendInvoiceEmail(invoice, filePath)

//   // Update invoice email status
//   await Invoice.update({ email_sent: true, email_sent_at: new Date() }, { where: { id: invoiceId } })

//   // Clean up temp file
//   fs.unlink(filePath, (err) => {
//     if (err) console.error("Error deleting temp file:", err)
//   })

//   res.status(httpStatus.OK).json({
//     success: true,
//     message: "Invoice sent successfully",
//   })
// })

// const recordPayment = catchAsync(async (req, res) => {
//   const payment = await billingService.processPayment(req.body, req.user?.id)

//   res.status(httpStatus.CREATED).json({
//     success: true,
//     message: "Payment recorded successfully",
//     data: payment,
//   })
// })

// const getGuestPaymentHistory = catchAsync(async (req, res) => {
//   const { guestId } = req.params
//   const { page, limit } = req.query

//   const paymentHistory = await billingService.getGuestPaymentHistory(guestId, { page, limit })

//   res.status(httpStatus.OK).json({
//     success: true,
//     data: paymentHistory,
//   })
// })

// const downloadReceiptPDF = catchAsync(async (req, res) => {
//   const { paymentId } = req.params
//   const payment = await Payments.findByPk(paymentId, {
//     include: [{ model: Invoice, as: "invoice", include: [{ model: Guests, as: "guest" }] }],
//   })

//   if (!payment) {
//     return res.status(httpStatus.NOT_FOUND).json({
//       success: false,
//       message: "Payment not found",
//     })
//   }

//   const fileName = `receipt-${payment.reference_number || payment.id}.pdf`
//   const filePath = path.join(__dirname, "../temp", fileName)

//   // Ensure temp directory exists
//   const tempDir = path.dirname(filePath)
//   if (!fs.existsSync(tempDir)) {
//     fs.mkdirSync(tempDir, { recursive: true })
//   }

//   await pdfService.generateReceiptPDF(payment, filePath)

//   res.download(filePath, fileName, (err) => {
//     if (err) {
//       console.error("Error downloading file:", err)
//     }
//     // Clean up temp file
//     fs.unlink(filePath, (unlinkErr) => {
//       if (unlinkErr) console.error("Error deleting temp file:", unlinkErr)
//     })
//   })
// })

// const processCheckout = catchAsync(async (req, res) => {
//   const { reservationId } = req.params

//   // Generate room charges if not already done
//   await billingService.generateRoomCharges(reservationId)

//   // Get folio
//   const folio = await billingService.getFolioByReservation(reservationId)

//   // Generate invoice
//   const invoice = await billingService.generateInvoiceFromFolio(folio.id, req.user?.id)

//   res.status(httpStatus.OK).json({
//     success: true,
//     message: "Checkout processed successfully",
//     data: { invoice, folio },
//   })
// })

// module.exports = {
//   getFolioByReservation,
//   getFolioDetails,
//   addChargeToFolio,
//   generateInvoiceFromFolio,
//   getInvoiceDetails,
//   downloadInvoicePDF,
//   emailInvoice,
//   recordPayment,
//   getGuestPaymentHistory,
//   downloadReceiptPDF,
//   processCheckout,
// }

const httpStatus = require("http-status")
const catchAsync = require("../utils/catchAsync")
// const { pdfService, emailService, billingService } = require("../services")
const path = require("path")
const fs = require("fs")
const { Payments, Guests, Invoice } = require("../models")
const { pdfService,billingService,emailService } = require("../services")

const getFolioByReservation = catchAsync(async (req, res) => {
  const { reservationId } = req.params
  const folio = await billingService.getFolioByReservation(reservationId)

  res.status(httpStatus.OK).json({
    success: true,
    data: folio,
  })
})

const getFolioDetails = catchAsync(async (req, res) => {
  const { folioId } = req.params
  const folio = await billingService.getFolioDetails(folioId)

  res.status(httpStatus.OK).json({
    success: true,
    data: folio,
  })
})

const addChargeToFolio = catchAsync(async (req, res) => {
  const { folioId } = req.params

  // Validate required fields
  const { charge_type, description, unit_price, quantity = 1, is_taxable = true } = req.body

  if (!charge_type || !description || !unit_price) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "charge_type, description, and unit_price are required",
    })
  }

  const chargeData = {
    ...req.body,
    tax_rate: req.body.tax_rate || billingService.GST_RATES.STANDARD,
  }

  const charge = await billingService.addChargeToFolio(
    folioId,
    chargeData,
    req.user?.id || "215cd88a-b951-44ac-a865-c51d497c28b4",
  )

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Charge added successfully",
    data: charge,
  })
})

const generateInvoiceFromFolio = catchAsync(async (req, res) => {
  const { folioId } = req.params
  const invoice = await billingService.generateInvoiceFromFolio(
    folioId,
    req.user?.id || "215cd88a-b951-44ac-a865-c51d497c28b4",
  )

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Invoice generated successfully",
    data: invoice,
  })
})

const getInvoiceDetails = catchAsync(async (req, res) => {
  const { invoiceId } = req.params
  const invoice = await billingService.getInvoiceDetails(invoiceId)

  res.status(httpStatus.OK).json({
    success: true,
    data: invoice,
  })
})

const downloadInvoicePDF = catchAsync(async (req, res) => {
  const { invoiceId } = req.params
  const invoice = await billingService.getInvoiceDetails(invoiceId)

  const fileName = `invoice-${invoice.invoice_number}.pdf`
  const filePath = path.join(__dirname, "../temp", fileName)

  // Ensure temp directory exists
  const tempDir = path.dirname(filePath)
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }

  await pdfService.generateInvoicePDF(invoice, filePath)

  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error("Error downloading file:", err)
    }
    // Clean up temp file
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) console.error("Error deleting temp file:", unlinkErr)
    })
  })
})

const emailInvoice = catchAsync(async (req, res) => {
  const { invoiceId } = req.params
  const { email_address } = req.body

  const invoice = await billingService.getInvoiceDetails(invoiceId)

  const fileName = `invoice-${invoice.invoice_number}.pdf`
  const filePath = path.join(__dirname, "../temp", fileName)

  // Ensure temp directory exists
  const tempDir = path.dirname(filePath)
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }

  await pdfService.generateInvoicePDF(invoice, filePath)
  await emailService.sendInvoiceEmail(invoice, filePath, email_address)

  // Update invoice email status
  await Invoice.update(
    {
      email_sent: true,
      email_sent_at: new Date(),
      email_sent_to: email_address,
    },
    { where: { id: invoiceId } },
  )

  // Clean up temp file
  fs.unlink(filePath, (err) => {
    if (err) console.error("Error deleting temp file:", err)
  })

  res.status(httpStatus.OK).json({
    success: true,
    message: "Invoice sent successfully",
  })
})

const recordPayment = catchAsync(async (req, res) => {
  // Validate required payment fields
  const { invoice_id, amount, payment_method = "cash",guest_id } = req.body

  if (!invoice_id || !amount) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "invoice_id and amount are required",
    })
  }

  if (Number.parseFloat(amount) <= 0) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Payment amount must be greater than zero",
    })
  }

  const paymentData = {
    ...req.body,
    payment_method,
    guest_id,
    status: req.body.status || "completed",
  }

  const payment = await billingService.processPayment(
    paymentData,
    req.user?.id || "215cd88a-b951-44ac-a865-c51d497c28b4",
  )

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Payment recorded successfully",
    data: payment,
  })
})

const getGuestPaymentHistory = catchAsync(async (req, res) => {
  const { guestId } = req.params
  const { page = 1, limit = 10 } = req.query

  const paymentHistory = await billingService.getGuestPaymentHistory(guestId, { page, limit })

  res.status(httpStatus.OK).json({
    success: true,
    data: paymentHistory,
  })
})

const downloadReceiptPDF = catchAsync(async (req, res) => {
  const { paymentId } = req.params
  const payment = await Payments.findByPk(paymentId, {
    include: [{ model: Invoice, as: "invoice", include: [{ model: Guests, as: "guest" }] }],
  })

  if (!payment) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Payment not found",
    })
  }

  const fileName = `receipt-${payment.reference_number || payment.id}.pdf`
  const filePath = path.join(__dirname, "../temp", fileName)

  // Ensure temp directory exists
  const tempDir = path.dirname(filePath)
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }

  await pdfService.generateReceiptPDF(payment, filePath)

  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error("Error downloading file:", err)
    }
    // Clean up temp file
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) console.error("Error deleting temp file:", unlinkErr)
    })
  })
})

const processCheckout = catchAsync(async (req, res) => {
  const { reservationId } = req.params

  try {
    // Get folio for the reservation
    const folio = await billingService.getFolioByReservation(reservationId)

    // Generate invoice if not already created
    let invoice
    try {
      invoice = await billingService.generateInvoiceFromFolio(
        folio.id,
        req.user?.id || "215cd88a-b951-44ac-a865-c51d497c28b4",
      )
    } catch (error) {
      if (error.message.includes("Invoice already exists")) {
        // Get existing invoice
        const existingInvoice = await Invoice.findOne({
          where: { reservation_id: reservationId },
        })
        invoice = await billingService.getInvoiceDetails(existingInvoice.id)
      } else {
        throw error
      }
    }

    res.status(httpStatus.OK).json({
      success: true,
      message: "Checkout processed successfully",
      data: {
        invoice,
        folio,
        summary: {
          subtotal: invoice.subtotal,
          tax_amount: invoice.tax_amount,
          total_amount: invoice.total_amount,
          paid_amount: invoice.paid_amount,
          balance_amount: invoice.balance_amount,
          status: invoice.status,
        },
      },
    })
  } catch (error) {
    console.error("Checkout processing error:", error)
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to process checkout",
    })
  }
})

// Additional utility endpoints
const getInvoiceSummary = catchAsync(async (req, res) => {
  const { invoiceId } = req.params
  const invoice = await billingService.getInvoiceDetails(invoiceId)

  const summary = {
    invoice_number: invoice.invoice_number,
    guest_name: `${invoice.guest.first_name} ${invoice.guest.last_name}`,
    subtotal: invoice.subtotal,
    tax_amount: invoice.tax_amount,
    total_amount: invoice.total_amount,
    paid_amount: invoice.paid_amount,
    balance_amount: invoice.balance_amount,
    status: invoice.status,
    due_date: invoice.due_date,
    items_count: invoice.items?.length || 0,
    payments_count: invoice.payments?.length || 0,
  }

  res.status(httpStatus.OK).json({
    success: true,
    data: summary,
  })
})

module.exports = {
  getFolioByReservation,
  getFolioDetails,
  addChargeToFolio,
  generateInvoiceFromFolio,
  getInvoiceDetails,
  downloadInvoicePDF,
  emailInvoice,
  recordPayment,
  getGuestPaymentHistory,
  downloadReceiptPDF,
  processCheckout,
  getInvoiceSummary,
}
