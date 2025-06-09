const { Invoice, Folio } = require("../models")

const generateInvoiceNumber = async () => {
  const currentYear = new Date().getFullYear()
  const prefix = `INV-${currentYear}-`

  // Find the latest invoice for the current year
  const latestInvoice = await Invoice.findOne({
    where: {
      invoice_number: {
        [require("sequelize").Op.like]: `${prefix}%`,
      },
    },
    order: [["created_at", "DESC"]],
  })

  let nextNumber = 1
  if (latestInvoice) {
    const lastNumber = Number.parseInt(latestInvoice.invoice_number.split("-").pop())
    nextNumber = lastNumber + 1
  }

  return `${prefix}${nextNumber.toString().padStart(6, "0")}`
}

const generateFolioNumber = async () => {
  const currentYear = new Date().getFullYear()
  const prefix = `FOL-${currentYear}-`

  // Find the latest folio for the current year
  const latestFolio = await Folio.findOne({
    where: {
      folio_number: {
        [require("sequelize").Op.like]: `${prefix}%`,
      },
    },
    order: [["created_at", "DESC"]],
  })

  let nextNumber = 1
  if (latestFolio) {
    const lastNumber = Number.parseInt(latestFolio.folio_number.split("-").pop())
    nextNumber = lastNumber + 1
  }

  return `${prefix}${nextNumber.toString().padStart(6, "0")}`
}

module.exports = {
  generateInvoiceNumber,
  generateFolioNumber,
}
