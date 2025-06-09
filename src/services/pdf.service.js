const PDFDocument = require("pdfkit")
const fs = require("fs")
const path = require("path")
const moment = require("moment")

const generateInvoicePDF = async (invoice, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const stream = fs.createWriteStream(outputPath)
      doc.pipe(stream)

      // Header
      doc.fontSize(20).text("HOTEL INVOICE", 50, 50)
      doc.fontSize(10).text(`Invoice #: ${invoice.invoice_number}`, 50, 80)
      doc.text(`Date: ${moment(invoice.invoice_date).format("DD/MM/YYYY")}`, 50, 95)
      doc.text(`Due Date: ${moment(invoice.due_date).format("DD/MM/YYYY")}`, 50, 110)

      // Hotel Details (Left side)
      doc.fontSize(12).text("Hotel Name", 50, 140)
      doc.fontSize(10).text("Hotel Address Line 1", 50, 155)
      doc.text("Hotel Address Line 2", 50, 170)
      doc.text("Phone: +91 XXXXXXXXXX", 50, 185)
      doc.text("Email: hotel@example.com", 50, 200)

      // Guest Details (Right side)
      doc.fontSize(12).text("Bill To:", 350, 140)
      doc.fontSize(10).text(`${invoice.guest.first_name} ${invoice.guest.last_name}`, 350, 155)
      doc.text(`Email: ${invoice.guest.email || "N/A"}`, 350, 170)
      doc.text(`Phone: ${invoice.guest.phone || "N/A"}`, 350, 185)

      // Reservation Details
      if (invoice.reservation) {
        doc.text(`Room: ${invoice.reservation.room_number?.room_number || "N/A"}`, 350, 200)
        doc.text(`Check-in: ${moment(invoice.reservation.check_in_date_time).format("DD/MM/YYYY")}`, 350, 215)
        doc.text(`Check-out: ${moment(invoice.reservation.check_out_date_time).format("DD/MM/YYYY")}`, 350, 230)
      }

      // Line separator
      doc.moveTo(50, 260).lineTo(550, 260).stroke()

      // Table headers
      let yPosition = 280
      doc.fontSize(10).text("Description", 50, yPosition)
      doc.text("Qty", 300, yPosition)
      doc.text("Rate", 350, yPosition)
      doc.text("Amount", 450, yPosition)

      // Line under headers
      doc
        .moveTo(50, yPosition + 15)
        .lineTo(550, yPosition + 15)
        .stroke()

      // Invoice items
      yPosition += 30
      let totalBeforeTax = 0

      invoice.items.forEach((item) => {
        if (yPosition > 700) {
          doc.addPage()
          yPosition = 50
        }

        doc.text(item.description, 50, yPosition)
        doc.text(item.quantity.toString(), 300, yPosition)
        doc.text(`₹${Number.parseFloat(item.unit_price).toFixed(2)}`, 350, yPosition)
        doc.text(`₹${Number.parseFloat(item.total_price).toFixed(2)}`, 450, yPosition)

        if (item.item_type !== "tax") {
          totalBeforeTax += Number.parseFloat(item.total_price)
        }

        yPosition += 20
      })

      // Totals section
      yPosition += 20
      doc.moveTo(350, yPosition).lineTo(550, yPosition).stroke()
      yPosition += 15

      doc.text("Subtotal:", 350, yPosition)
      doc.text(`₹${Number.parseFloat(invoice.subtotal).toFixed(2)}`, 450, yPosition)
      yPosition += 15

      if (invoice.tax_amount > 0) {
        doc.text("Tax:", 350, yPosition)
        doc.text(`₹${Number.parseFloat(invoice.tax_amount).toFixed(2)}`, 450, yPosition)
        yPosition += 15
      }

      if (invoice.discount_amount > 0) {
        doc.text("Discount:", 350, yPosition)
        doc.text(`-₹${Number.parseFloat(invoice.discount_amount).toFixed(2)}`, 450, yPosition)
        yPosition += 15
      }

      // Total line
      doc.moveTo(350, yPosition).lineTo(550, yPosition).stroke()
      yPosition += 15

      doc.fontSize(12).text("Total:", 350, yPosition)
      doc.text(`₹${Number.parseFloat(invoice.total_amount).toFixed(2)}`, 450, yPosition)
      yPosition += 20

      // Payment status
      if (invoice.paid_amount > 0) {
        doc.fontSize(10).text("Paid:", 350, yPosition)
        doc.text(`₹${Number.parseFloat(invoice.paid_amount).toFixed(2)}`, 450, yPosition)
        yPosition += 15

        doc.text("Balance:", 350, yPosition)
        doc.text(`₹${Number.parseFloat(invoice.balance_amount).toFixed(2)}`, 450, yPosition)
      }

      // Footer
      doc.fontSize(8).text("Thank you for staying with us!", 50, 750)
      doc.text("This is a computer generated invoice.", 50, 765)

      doc.end()

      stream.on("finish", () => {
        resolve(outputPath)
      })

      stream.on("error", (error) => {
        reject(error)
      })
    } catch (error) {
      reject(error)
    }
  })
}

const generateReceiptPDF = async (payment, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const stream = fs.createWriteStream(outputPath)
      doc.pipe(stream)

      // Header
      doc.fontSize(20).text("PAYMENT RECEIPT", 50, 50)
      doc.fontSize(10).text(`Receipt #: ${payment.id}`, 50, 80)
      doc.text(`Date: ${moment(payment.payment_date).format("DD/MM/YYYY HH:mm")}`, 50, 95)

      // Hotel Details
      doc.fontSize(12).text("Hotel Name", 50, 130)
      doc.fontSize(10).text("Hotel Address", 50, 145)

      // Payment Details
      doc.fontSize(12).text("Payment Details:", 50, 180)
      doc.fontSize(10).text(`Amount: ₹${Number.parseFloat(payment.amount).toFixed(2)}`, 50, 200)
      doc.text(`Method: ${payment.payment_method.replace("_", " ").toUpperCase()}`, 50, 215)
      doc.text(`Reference: ${payment.reference_number || "N/A"}`, 50, 230)
      doc.text(`Status: ${payment.status.toUpperCase()}`, 50, 245)

      if (payment.invoice) {
        doc.text(`Invoice #: ${payment.invoice.invoice_number}`, 50, 260)
        doc.text(`Guest: ${payment.invoice.guest?.first_name} ${payment.invoice.guest?.last_name}`, 50, 275)
      }

      // Footer
      doc.fontSize(8).text("Thank you for your payment!", 50, 350)

      doc.end()

      stream.on("finish", () => {
        resolve(outputPath)
      })

      stream.on("error", (error) => {
        reject(error)
      })
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  generateInvoicePDF,
  generateReceiptPDF,
}
