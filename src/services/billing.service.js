
const httpStatus = require("http-status")
const ApiError = require("../utils/ApiError")
const { Op } = require("sequelize")
const {
  Invoice,
  InvoiceItem,
  Payments,
  Folio,
  FolioCharge,
  Reservation,
  Guests,
  RoomNumber,
  Room,
  sequelize,
  Package,
  RestaurantFolio,
  RestaurantFolioCharge,
  RestaurantOrder,
  RestaurantInvoice,
} = require("../models")
const moment = require("moment")
const { generateInvoiceNumber, generateFolioNumber } = require("../utils/numberGenerators")
const RestaurantInvoiceItem = require("../models/restaurant_Invoice_Item")

// GST Configuration
const GST_RATES = {
  STANDARD: 18.0, // Standard GST rate for hotel services
  REDUCED: 12.0, // Reduced rate for certain services
  EXEMPT: 0.0, // Exempt services
}

const createFolio = async (reservationId, guestId, transaction = null) => {
  const folioNumber = await generateFolioNumber()
  const folio = await Folio.create(
    {
      reservation_id: reservationId,
      guest_id: guestId,
      folio_number: folioNumber,
      status: "active",
      total_charges: 0,
      total_payments: 0,
      balance: 0,
      opened_date: new Date(),
    },
    { transaction },
  )
  console.log("create folio", folio)

  return folio
}

const addChargeToFolio = async (folioId, chargeData, userId = null) => {
  const transaction = await sequelize.transaction()
  console.log("add folio chatgee ")

  try {
    const folio = await Folio.findByPk(folioId, { transaction })

    if (!folio) {
      throw new ApiError(httpStatus.NOT_FOUND, "Guest folio not found")
    }

    if (folio.status !== "active") {
      throw new ApiError(httpStatus.BAD_REQUEST, "Cannot add charges to closed folio")
    }

    const unitPrice = Number.parseFloat(chargeData.unit_price) || 0
    const quantity = Number.parseInt(chargeData.quantity) || 1
    const baseAmount = unitPrice * quantity

    // Calculate GST
    const taxRate = Number.parseFloat(chargeData.tax_rate) || GST_RATES.STANDARD
    const taxAmount = chargeData.is_taxable ? (baseAmount * taxRate) / 100 : 0
    const totalAmount = baseAmount + taxAmount

    const charge = await FolioCharge.create(
      {
        folio_id: folioId,
        charge_type: chargeData.charge_type,
        description: chargeData.description,
        amount: baseAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        quantity: quantity,
        unit_price: unitPrice,
        charge_date: chargeData.charge_date || new Date(),
        posted_by: userId,
        is_taxable: chargeData.is_taxable || false,
        tax_rate: chargeData.taxRate || 0,
        notes: chargeData.notes,
      },
      { transaction },
    )

    await updateFolioTotals(folioId, transaction)

    await transaction.commit()
    return charge
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

const updateFolioTotals = async (folioId, transaction = null) => {
  try {
    const charges = await FolioCharge.findAll({
      where: { folio_id: folioId },
      transaction,
    })

    const totalCharges = charges.reduce(
      (sum, charge) => sum + Number.parseFloat(charge.total_amount || charge.amount),
      0,
    )
    // const totalTax = charges.reduce((sum, charge) => sum + Number.parseFloat(charge.tax_amount || 0), 0)
    const totalTax = parseFloat(parseFloat(totalCharges * GST_RATES.STANDARD / 100).toFixed(2))
    const folio = await Folio.findByPk(folioId, { transaction })
    if (!folio) {
      throw new Error(`Folio with ID ${folioId} not found`)
    }

    // Calculate total payments
    const invoices = await Invoice.findAll({
      where: { reservation_id: folio.reservation_id },
      transaction,
    })

    const invoiceIds = invoices.map((invoice) => invoice.id)
    let totalPayments = 0

    if (invoiceIds.length > 0) {
      const payments = await Payments.findAll({
        where: { invoice_id: { [Op.in]: invoiceIds } },
        transaction,
      })

      totalPayments = payments.reduce((sum, payment) => sum + Number.parseFloat(payment.amount || 0), 0)
    }

    const balance = totalCharges + totalTax - totalPayments

    await Folio.update(
      {
        total_charges: totalCharges + totalTax,
        total_tax: totalTax,
        total_payments: totalPayments,
        balance: balance,
      },
      {
        where: { id: folioId },
        transaction,
      },
    )

    return { totalCharges, totalTax, totalPayments, balance }
  } catch (error) {
    console.error("Error updating folio totals:", error)
    throw error
  }
}

const generateRoomCharges = async (reservationId, roomNumberIds = [], transaction = null) => {
  try {
    const reservation = await Reservation.findByPk(reservationId, { transaction })
    if (!reservation) {
      throw new ApiError(httpStatus.NOT_FOUND, "Reservation not found")
    }

    const folio = await Folio.findOne({
      where: { reservation_id: reservationId },
      transaction,
    })

    if (!folio) {
      throw new ApiError(httpStatus.NOT_FOUND, "Folio not found for reservation")
    }

    // Get room details for all rooms
    const roomNumbers = await RoomNumber.findAll({
      where: { id: { [Op.in]: roomNumberIds } },
      include: [
        {
          model: Room,
          as: "room",
        },
      ],
      transaction,
    })

    if (!roomNumbers.length) {
      throw new ApiError(httpStatus.NOT_FOUND, "No room numbers found")
    }

    // Calculate number of nights
    const checkIn = new Date(reservation.check_in_date_time)
    const checkOut = new Date(reservation.check_out_date_time)
    const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)))

    let totalRoomCharges = 0
    let totalTaxAmount = 0

    // Create charges for each room
    for (const roomNumber of roomNumbers) {
      const roomRate = Number.parseFloat(roomNumber?.room?.price || 0)
      const baseAmount = roomRate * nights
      const taxAmount = (baseAmount * GST_RATES.STANDARD) / 100
      const totalAmount = baseAmount + taxAmount

      totalRoomCharges += totalAmount
      totalTaxAmount += taxAmount

      await FolioCharge.create(
        {
          folio_id: folio.id,
          charge_type: "room_charge",
          description: `Room ${roomNumber.room_number || "Unknown"} - ${nights} night(s)`,
          amount: baseAmount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          quantity: nights,
          unit_price: roomRate,
          charge_date: new Date(),
          is_taxable: true,
          tax_rate: GST_RATES.STANDARD,
        },
        { transaction },
      )
    }
    console.log("folio charge add")

    await updateFolioTotals(folio.id, transaction)
    return folio
  } catch (error) {
    console.error("Error generating room charges:", error)
    throw error
  }
}

/**
 * INVOICE GENERATION PROCESS
 *
 * 1. Retrieve folio with all charges
 * 2. Validate folio status and data
 * 3. Calculate totals (subtotal, tax, grand total)
 * 4. Create invoice record with unique invoice number
 * 5. Create invoice items from folio charges
 * 6. Add tax summary as separate line items
 * 7. Close the folio
 * 8. Return complete invoice with all details
 */
const generateInvoiceFromFolio = async (folioId, userId = null, transaction = null) => {
  const shouldCommit = !transaction;
  if (shouldCommit) {
    transaction = await sequelize.transaction();
  }

  try {
    const folio = await Folio.findByPk(folioId, {
      include: [
        { model: FolioCharge, as: "charges" },
        { model: Reservation, as: "reservation" },
        { model: Guests, as: "guest" },
      ],
      transaction,
    });

    if (!folio) {
      throw new ApiError(httpStatus.NOT_FOUND, "Folio not found");
    }

    const invoiceNumber = await generateInvoiceNumber();

    // Calculate invoice totals
    let subtotal = 0;
    folio.charges.forEach((charge) => {
      subtotal += Number.parseFloat(charge.amount || 0);
    });

    const totalTaxAmount = parseFloat(parseFloat(subtotal * GST_RATES.STANDARD / 100).toFixed(2));
    const totalAmount = subtotal + totalTaxAmount;

    // Create invoice
    const invoice = await Invoice.create(
      {
        invoice_number: invoiceNumber,
        reservation_id: folio.reservation_id,
        guest_id: folio.guest_id,
        folio_id: folioId,
        subtotal: subtotal,
        tax_amount: totalTaxAmount,
        total_amount: totalAmount,
        balance_amount: totalAmount || 0,
        paid_amount: 0,
        due_date: moment().add(7, "days").toDate(),
        status: "sent",
        generated_by: userId,
        generated_date: new Date(),
      },
      { transaction },
    );

    // Create invoice items from folio charges
    for (const charge of folio.charges) {
      const tax_amount = parseFloat(parseFloat(charge.amount * GST_RATES.STANDARD / 100).toFixed(2));
console.log("tax_amount",tax_amount)
      await InvoiceItem.create(
        {
          invoice_id: invoice.id,
          item_type: charge.charge_type,
          description: charge.description,
          quantity: charge.quantity,
          unit_price: charge.unit_price,
          amount: charge.amount,
          tax_rate: GST_RATES.STANDARD,
          tax_amount: tax_amount,
          // total_price: charge.amount + tax_amount,
          total_price: parseFloat(charge.amount || 0) + tax_amount,
          date_charged: charge.charge_date,
          is_taxable: charge.is_taxable,
        },
        { transaction },
      );
    }

    if (shouldCommit) {
      await transaction.commit();
    }
    return invoice;
  } catch (error) {
    if (shouldCommit) {
      await transaction.rollback();
    }
    throw error;
  }
};

/**
 * PAYMENT RECORD CREATION PROCESS
 *
 * 1. Validate invoice exists and payment data
 * 2. Create payment record with transaction details
 * 3. Update invoice payment status and amounts
 * 4. Calculate remaining balance
 * 5. Update invoice status (paid/partially_paid/overdue)
 * 6. Generate payment receipt number
 * 7. Log payment in audit trail
 */
const processPayment = async (paymentData, userId = null, transaction = null) => {
  const shouldCommit = !transaction;
  if (shouldCommit) {
    transaction = await sequelize.transaction();
  }

  try {
    const invoice = paymentData.invoice_id 
      ? await Invoice.findByPk(paymentData.invoice_id, { transaction }) 
      : null;

    const paymentAmount = Number.parseFloat(paymentData.amount);
    if (paymentAmount <= 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Payment amount must be greater than zero");
    }

    // Generate payment reference if not provided
    const referenceNumber =
      paymentData.reference_number || `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const payment = await Payments.create(
      {
        invoice_id: paymentData.invoice_id,
        reservation_id: paymentData.reservation_id,
        guest_id: paymentData.guest_id,
        payment_method: paymentData.payment_method || "cash",
        amount: paymentAmount,
        transaction_id: paymentData.transaction_id,
        reference_number: referenceNumber,
        payment_date: paymentData.payment_date || new Date(),
        status: paymentData.status || "completed",
        notes: paymentData.notes,
        processed_by: userId,
        currency: paymentData.currency || "INR",
        exchange_rate: paymentData.exchange_rate || 1.0
      },
      { transaction },
    );

    // Update invoice amounts if invoice exists
    if (invoice) {
      const currentPaid = Number.parseFloat(invoice.paid_amount || 0);
      const totalPaid = currentPaid + paymentAmount;
      const totalAmount = Number.parseFloat(invoice.total_amount);
      const balance = Math.max(0, totalAmount - totalPaid);

      let status = "partially_paid";
      if (balance <= 0) {
        status = "paid";
      } else if (totalPaid === 0) {
        status = "sent";
      } else if (new Date() > new Date(invoice.due_date) && balance > 0) {
        status = "overdue";
      }

      await Invoice.update(
        {
          paid_amount: totalPaid,
          balance_amount: balance,
          status: status,
          last_payment_date: new Date(),
        },
        {
          where: { id: paymentData.invoice_id },
          transaction,
        },
      );
    }

    // Update folio if still active
    const folio = await Folio.findOne({
      where: { reservation_id: paymentData.reservation_id },
      transaction,
    });

    if (folio) {
      await updateFolioTotals(folio.id, transaction);
    }

    if (shouldCommit) {
      await transaction.commit();
    }
    return payment;
  } catch (error) {
    if (shouldCommit) {
      await transaction.rollback();
    }
    throw error;
  }
};

// Safe wrapper functions for error handling
const safelyCreateFolio = async (reservationId, guestId, transaction = null) => {
  try {
    console.log("safely generate folio")
    return await createFolio(reservationId, guestId, transaction)
  } catch (error) {
    console.error("Error creating folio:", error)
    return {
      id: null,
      folio_number: "ERROR-CREATING-FOLIO",
      reservation_id: reservationId,
      guest_id: guestId,
    }
  }
}

const safelyGenerateRoomCharges = async (reservationId, roomNumberIds = [], transaction = null) => {
  try {
    console.log("safey generate rooms")

    return await generateRoomCharges(reservationId, roomNumberIds, transaction)
  } catch (error) {
    console.error("Error generating room charges:", error)
    return null
  }
}

const safelyAddChargeToFolio = async (folioId, chargeData, userId = null, transaction = null) => {
  if (!folioId) {
    console.log("Skipping charge addition - no valid folio ID")
    return null
  }
  console.log("safely  add charge")
  console.log("chargeData", chargeData)
  try {
    const unitPrice = Number.parseFloat(chargeData.unit_price || 0)
    const quantity = Number.parseInt(chargeData.quantity || 1)
    const discount = Number.parseFloat(chargeData.discount || 0);
    const baseAmount = unitPrice * quantity - discount;
    // const baseAmount = unitPrice * quantity - chargeData.discount
    const taxRate = Number.parseFloat(GST_RATES.STANDARD)
    const taxAmount = chargeData.is_taxable ? (baseAmount * taxRate) / 100 : 0
    const totalAmount = baseAmount + taxAmount

    console.log("totalAmount", totalAmount)
    console.log("unitPrice", unitPrice, "taxRate", taxRate)
    console.log("quantity", quantity)
    console.log("taxAmount", taxAmount)

    if (isNaN(totalAmount)) {
      console.error("Invalid charge amount calculation")
      return null
    }

    const charge = await FolioCharge.create(
      {
        folio_id: folioId,
        charge_type: chargeData.charge_type || "other",
        description: chargeData.description || "Miscellaneous charge",
        amount: baseAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        quantity: quantity,
        unit_price: unitPrice,
        charge_date: chargeData.charge_date || new Date(),
        posted_by: userId,
        is_taxable: chargeData.is_taxable || false,
        tax_rate: taxRate,
        discount,
        notes: chargeData.notes,
        payment_status: chargeData.payment_status,
        room_id: chargeData?.room_id,
        service_id: chargeData?.service_id,
        item_type: chargeData?.item_type,
        item_description: chargeData?.item_description,
        details: chargeData?.details ? JSON.stringify(chargeData.details) : null,
      },
      { transaction },
    )
    console.log("chargecharge", charge)
    await updateFolioTotals(folioId, transaction)
    return charge
  } catch (error) {
    console.error("Error adding charge to folio:", error)
    return null
  }
}

const getFolioByReservation = async (reservationId) => {
  const folio = await Folio.findOne({
    where: { reservation_id: reservationId },
    include: [
      {
        model: FolioCharge,
        as: "charges",
        order: [["charge_date", "ASC"]],
      },
      {
        model: Reservation,
        as: "reservation",
        // include: [
        //   {
        //     model: RoomNumber,
        //     as: "room_numbers", // Updated for multiple rooms
        //   },
        // ],
      },
      { model: Guests, as: "guest" },
    ],
  })

  if (!folio) {
    throw new ApiError(httpStatus.NOT_FOUND, "Folio not found for this reservation")
  }

  folio.dataValues.GST_RATES = GST_RATES

  return folio
}

const getFolioDetails = async (folioId) => {
  const folio = await Folio.findByPk(folioId, {
    include: [
      {
        model: FolioCharge,
        as: "charges",
        order: [["charge_date", "ASC"]],
      },
      {
        model: Reservation,
        as: "reservation",
      },
      { model: Guests, as: "guest" },
    ],
  })

  if (!folio) {
    throw new ApiError(httpStatus.NOT_FOUND, "Folio not found")
  }

  return folio
}

const getInvoiceDetails = async (invoiceId) => {
  const invoice = await Invoice.findByPk(invoiceId, {
    include: [
      {
        model: InvoiceItem,
        as: "items",
        order: [["date_charged", "ASC"]],
      },
      {
        model: Payments,
        as: "payments",
        order: [["payment_date", "DESC"]],
      },
      {
        model: Reservation,
        as: "reservation",
      },
      { model: Guests, as: "guest" },
    ],
  })

  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invoice not found")
  }

  return invoice
}

// const getGuestPaymentHistory = async (guestId, options = {}) => {
//   const { page = 1, limit = 10 } = options
//   const offset = (page - 1) * limit

//   const payments = await Payments.findAndCountAll({
//     include: [
//       {
//         model: Invoice,
//         as: "invoice",
//         where: { guest_id: guestId },
//         include: [{ model: Reservation, as: "reservation" }],
//       },
//     ],
//     order: [["payment_date", "DESC"]],
//     limit: Number.parseInt(limit),
//     offset: offset,
//   })

//   return {
//     payments: payments.rows,
//     total: payments.count,
//     totalPages: Math.ceil(payments.count / limit),
//     currentPage: Number.parseInt(page),
//   }
// }


const getGuestPaymentHistory = async (guestId, options = {}) => {
  const { page = 1, limit = 10 } = options;
  const offset = (page - 1) * limit;

  const payments = await Payments.findAndCountAll({
    include: [
      {
        model: Invoice,
        as: "invoice",
        where: { guest_id: guestId },
        include: [
          {
            model: Reservation,
            as: "reservation"
          },
        ],
      },
    ],
    order: [["payment_date", "DESC"]],
    limit: Number.parseInt(limit),
    offset: offset,
  });

  // Enrich data
  const enrichedPayments = await Promise.all(
    payments.rows.map(async (payment) => {
      const reservation = payment.invoice?.reservation;

      // Fetch room numbers and types
      const roomDetails = await Promise.all(
        (reservation?.rooms || []).map(async ({ room_id, room_type }) => {
          const room = await RoomNumber.findByPk(room_id);
          const type = await Room.findByPk(room_type);
          return {
            room_number: room?.room_number,
            room_type: type?.room_type,
          };
        })
      );

      const packageDetails = await Promise.all(
        (reservation?.services || []).map(async (service) => {
          const pkg = await Package.findByPk(service.package_id);
          console.log(pkg, "pkg")
          return pkg
            ? {
              name: pkg.name,
              price: pkg.price,
            }
            : null;
        })
      );
      const paymentJson = payment.toJSON();
      if (paymentJson.invoice?.reservation) {
        paymentJson.invoice.reservation.room_details = roomDetails;
        paymentJson.invoice.reservation.package_names = packageDetails;
      }
      return paymentJson;
    })
  );

  return {
    payments: enrichedPayments,
    total: payments.count,
    totalPages: Math.ceil(payments.count / limit),
    currentPage: Number.parseInt(page),
  };
};

const generateInvoiceFromRestaurantFolio = async (folioId,userId) => {
  const transaction = await sequelize.transaction()

  try {
    const folio = await RestaurantFolio.findByPk(folioId, {
      include: [
        { model: RestaurantFolioCharge, as: "charges" },
        { model: RestaurantOrder, as: "reservation" },
        // { model: Guests, as: "guest" },
      ],
      transaction,
    })

    if (!folio) {
      throw new ApiError(httpStatus.NOT_FOUND, "Folio not found")
    }

    // Check if invoice already exists
    const existingInvoice = await RestaurantInvoice.findOne({
      where: { order_id: folio.order_id },
      transaction,
    })

    if (existingInvoice) {
      // throw new ApiError(httpStatus.BAD_REQUEST, "Invoice already exists for this reservation")
    }

    const invoiceNumber = await generateInvoiceNumber()

    // Calculate invoice totals
    let subtotal = 0
    // let totalTaxAmount = 0
    const taxBreakdown = {}

    folio.charges.forEach((charge) => {
      const chargeAmount = Number.parseFloat(charge.amount || 0)
      const taxAmount = 0

      subtotal += chargeAmount

      // Group taxes by rate for breakdown
      // if (charge.is_taxable && charge.tax_rate > 0) {
      //   const rate = charge.tax_rate
      //   if (!taxBreakdown[rate]) {
      //     taxBreakdown[rate] = { taxableAmount: 0, taxAmount: 0 }
      //   }
      //   taxBreakdown[rate].taxableAmount += chargeAmount
      //   taxBreakdown[rate].taxAmount += taxAmount
      // }
      // totalTaxAmount += taxAmount

    })

    const totalTaxAmount = parseFloat(parseFloat(subtotal * GST_RATES.STANDARD / 100).toFixed(2))
    const totalAmount = subtotal + totalTaxAmount


    // Create invoice
    const invoice = await RestaurantInvoice.create(
      {
        invoice_number: invoiceNumber,
        subtotal: subtotal,
        tax_amount: totalTaxAmount,
        total_amount: totalAmount,
        balance_amount: totalAmount || 0,
        paid_amount: 0,
        due_date: moment().add(7, "days").toDate(),
        status: "unpaid",
        tax_breakdown: taxBreakdown,
        generated_by: userId,
        issued_at: new Date(),
      },
      { transaction },
    )

    // Create invoice items from folio charges
    for (const charge of folio.charges) {

      const tax_amount = parseFloat(parseFloat(charge.amount * GST_RATES.STANDARD / 100).toFixed(2))

      await RestaurantInvoiceItem.create(
        {
          invoice_id: invoice.id,
          item_type: charge.charge_type,
          description: charge.description,
          quantity: charge.quantity,
          unit_price: charge.unit_price,
          total_price: charge.total_amount + tax_amount,
          amount: charge.amount,
          tax_rate: charge.tax_rate,
          tax_amount: tax_amount,
          date_charged: charge.charge_date,
          is_taxable: charge.is_taxable,
          // total_price: charge.total_price || charge.total_amount || 0,
        },
        { transaction },
      )
    }

    // Close folio
    // await Folio.update(
    //   {
    //     status: "closed",
    //     closed_date: new Date(),
    //     invoice_id: invoice.id,
    //   },
    //   {
    //     where: { id: folioId },
    //     transaction,
    //   },
    // )

    await transaction.commit()
    return invoice
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

module.exports = {
  createFolio,
  addChargeToFolio,
  generateRoomCharges,
  generateInvoiceFromFolio,
  processPayment,
  getGuestPaymentHistory,
  getFolioDetails,
  getInvoiceDetails,
  getFolioByReservation,
  updateFolioTotals,
  safelyAddChargeToFolio,
  safelyGenerateRoomCharges,
  safelyCreateFolio,
  GST_RATES,
  generateInvoiceFromRestaurantFolio,
}
