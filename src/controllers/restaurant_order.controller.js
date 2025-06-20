const { RestaurantOrder, RestaurantOrderItem, Variant, RestaurantTable, Guests, GuestDetail, TableBooking, sequelize, RestaurantUser, Folio, FolioCharge, Invoice, RestaurantFolio, RestaurantFolioCharge, Subcategory, RestaurantPayment, RestaurantInvoice, RestaurantInvoiceItem, RoomNumber, Category } = require('../models');
const { Op, or } = require('sequelize');
const paginate = require('../models/plugins/paginate.plugin');
const { safelyAddChargeToFolio, generateInvoiceFromRestaurantFolio } = require('../services/billing.service');
const sendResponse = require('../utils/sendResponse');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Payments = require('../models/payment.model');

// Create a new order
exports.createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      table_id,
      guest_id,
      room_number_id,
      comment,
      tip = 0,
      discount = 0,
      service_charge = 0,
      tax = 0,
      order_items,
      name,
      email,
      phone,
      date_time,
      booking_date = new Date(),
    } = req.body;
    let { order_type, guest_type } = req.body;

    let guestId = null;
    let folioId = null;
    let guestName = name || '';
    let newGuest = null;
    let guestType = guest_type;

    if (!order_items || order_items.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'At least one order item is required');
    }

    if (guest_id && guestType === 'hotel_guest') {
      const hotelGuest = await Guests.findByPk(guest_id, { transaction: t });
      if (!hotelGuest) throw new ApiError(httpStatus.NOT_FOUND, 'Guest not found');
      guestType = 'hotel_guest';
      guestName = `${hotelGuest.first_name} ${hotelGuest.last_name}`;
      guestId = guest_id;
      const folio = await Folio.findOne({ where: { guest_id }, transaction: t });
      folioId = folio?.id;
    } else {
      if (name || email || phone) {
        newGuest = await RestaurantUser.create({
          name: name || 'Walk-in Guest',
          email: email || null,
          phone: phone || null,
        }, { transaction: t });
        guestId = newGuest.id;
        guestType = 'restaurant_guest'
      }
    }

    // Calculate totals
    let totalItemAmount = 0;

    for (const item of order_items || []) {
      const { subcategory_id, variant_id, quantity = 1 } = item;

      if (!subcategory_id) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'subcategory_id is required for each item');
      }

      const subcategory = await Subcategory.findByPk(subcategory_id, { transaction: t });
      if (!subcategory) {
        throw new ApiError(httpStatus.NOT_FOUND, `Subcategory with ID ${subcategory_id} not found`);
      }

      const basePrice = parseFloat(subcategory.price || 0);
      let variantPrice = 0;

      if (variant_id) {
        const variant = await Variant.findByPk(variant_id, { transaction: t });
        if (!variant) {
          throw new ApiError(httpStatus.NOT_FOUND, `Variant with ID ${variant_id} not found`);
        }
        variantPrice = parseFloat(variant.price || 0);
      }

      const unitPrice = basePrice;
      const totalPrice = (parseFloat(unitPrice)+parseFloat(variantPrice)) * quantity;

      item.unit_price = unitPrice;
      item.total_price = totalPrice;
      item.variant_price=variantPrice
      totalItemAmount += totalPrice;
    }

    const subtotal = totalItemAmount;
    const discountAmount = parseFloat(((totalItemAmount * discount) / 100).toFixed(2));
    const serviceChargeAmount = parseFloat(((subtotal * service_charge) / 100).toFixed(2));
    const gstAmount = parseFloat((((subtotal+serviceChargeAmount) * tax) / 100).toFixed(2));
    const totalAmount = subtotal - discountAmount + gstAmount + serviceChargeAmount + tip;
    console.log("totalAmount",totalAmount,subtotal,gstAmount,serviceChargeAmount,tip)
    if (table_id) {
      const table = await RestaurantTable.findByPk(table_id);
      if (!table) {
        throw new ApiError(httpStatus.NOT_FOUND, "Table not found");
      } else {
        order_type = 'table_booking';
      }
    }

    const order = await RestaurantOrder.create({
      table_id,
      guest_id: guestId,
      guest_type: guestType,
      room_number_id: room_number_id || null,
      order_type,
      status: 'pending',
      booking_date,
      comment,
      tip,
      discount,
      service_charge,
      tax,
      total_amount: totalAmount,
    }, { transaction: t });

    if (table_id) {
      await TableBooking.create({
        table_id,
        guest_id: guestId,
        walkin_name: guestName,
        status: 'booked',
        order_id: order.id,
        booking_time: date_time,
      }, { transaction: t });
    }

    // Order Items
    for (const item of order_items || []) {
      await RestaurantOrderItem.create({
        order_id: order.id,
        subcategory_id: item.subcategory_id,
        variant_id: item.variant_id || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        variant_price: item.variant_price,
        total_price: item.total_price,
        notes: item.notes || null,
      }, { transaction: t });
    }

    // Restaurant Folio
    const restaurantFolio = await RestaurantFolio.create({
      guest_type: guestType,
      guest_ref_id: guestId,
      order_id: order.id,
      status: 'open',
    }, { transaction: t });

    await RestaurantFolioCharge.create({
      folio_id: restaurantFolio.id,
      description: `Restaurant Order #${order.id}`,
      amount: totalAmount,
    }, { transaction: t });

    // Link to Hotel Folio (if hotel_guest)
    if (folioId) {
      await FolioCharge.create({
        folio_id: folioId,
        charge_type: 'restaurant',
        description: `Restaurant Order for ${guestName}`,
        unit_price: amountAfterDiscount,
        quantity: 1,
        discount,
        tax_rate: tax,
        amount: totalAmount,
        charge_date: date_time || new Date(),
        is_taxable: true,
        posted_by: null,
        details: JSON.stringify({
          order_id: order.id,
          tip,
          discount,
          service_charge,
          gst_amount: gstAmount,
          gst_rate: tax,
        }),
      }, { transaction: t });

      const charges = await FolioCharge.findAll({
        where: { folio_id: folioId },
        transaction: t,
      });

      const totalCharges = charges.reduce(
        (sum, charge) => sum + parseFloat(charge.total_amount || charge.amount || 0),
        0
      );
      const totalTax = charges.reduce(
        (sum, charge) => sum + parseFloat(charge.tax_amount || 0),
        0
      );

      const folio = await Folio.findByPk(folioId, { transaction: t });
      if (!folio) throw new Error(`Folio with ID ${folioId} not found`);

      const invoices = await Invoice.findAll({
        where: { reservation_id: folio.reservation_id },
        transaction: t,
      });

      const invoiceIds = invoices.map((invoice) => invoice.id);
      let totalPayments = 0;

      if (invoiceIds.length > 0) {
        const payments = await Payments.findAll({
          where: { invoice_id: { [Op.in]: invoiceIds } },
          transaction: t,
        });

        totalPayments = payments.reduce(
          (sum, payment) => sum + parseFloat(payment.amount || 0),
          0
        );
      }

      const balance = totalCharges - totalPayments;

      await Folio.update({
        total_charges: totalCharges,
        total_tax: totalTax,
        total_payments: totalPayments,
        balance,
      }, {
        where: { id: folioId },
        transaction: t,
      });
    }

    await t.commit();

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Restaurant order created successfully',
      data: {
        order_id: order.id,
        guest_type: guestType,
        guest_id: guestId,
      },
    });
  } catch (err) {
    if (!t.finished) await t.rollback();
    console.error('Create Order Error:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      table_id,
      comment,
      tip = 0,
      discount = 0,
      service_charge = 0,
      tax = 0,
      status,
      order_items,
      name,
      email,
      phone,
      date_time: booking_time,
      guest_id,
      order_type,
      guest_type,
    } = req.body;

    const order = await RestaurantOrder.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: false,
        message: "Order not found",
      });
    }
    if (order.status === 'cancelled') {
      throw new ApiError(httpStatus.BAD_REQUEST, ' This order is alredy is cancelled');

    }
    // === Update guest or restaurant user details ===
    if (order.guest_id) {
      if (order.guest_type === 'hotel_guest') {
        const guest = await Guests.findByPk(order.guest_id, { transaction: t });
        if (guest) {
          await guest.update(
            {
              first_name: name ? name.split(" ")[0] : guest.first_name,
              last_name: name ? name.split(" ").slice(1).join(" ") : guest.last_name,
              email: email ?? guest.email,
              phone: phone ?? guest.phone,
            },
            { transaction: t }
          );
        }
      } else if (order.guest_type === 'restaurant_guest') {
        const restaurantUser = await RestaurantUser.findByPk(order.restaurant_user_id, { transaction: t });
        if (restaurantUser) {
          await restaurantUser.update(
            {
              name: name ?? restaurantUser.name,
              email: email ?? restaurantUser.email,
              phone: phone ?? restaurantUser.phone,
            },
            { transaction: t }
          );
        }
      }
    }
    else {
      if (guest_id && guest_type === 'hotel_guest') {
        const hotelGuest = await Guests.findByPk(guest_id, { transaction: t });
        if (!hotelGuest) throw new ApiError(httpStatus.NOT_FOUND, 'Guest not found');
        guestType = 'hotel_guest';
        guestName = `${hotelGuest.first_name} ${hotelGuest.last_name}`;

        const folio = await Folio.findOne({ where: { guest_id }, transaction: t });
        folioId = folio?.id;
      } else {
        if (name || email || phone) {
          newGuest = await RestaurantUser.create({
            name: name || 'Walk-in Guest',
            email: email || null,
            phone: phone || null,
          }, { transaction: t });
        }
        guestId = newGuest.id;
        guestName = name;
        guestType = 'restaurant_guest'
      }
    }

    // === Recalculate and recreate order items ===
    let totalItemAmount = 0;

    if (Array.isArray(order_items)) {
      await RestaurantOrderItem.destroy({
        where: { order_id: order.id },
        transaction: t,
      });

      for (const item of order_items) {
        const { subcategory_id, variant_id, quantity = 1 } = item;

        if (!subcategory_id) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'subcategory_id is required for each item');
        }

        const subcategory = await Subcategory.findByPk(subcategory_id, { transaction: t });
        if (!subcategory) {
          throw new ApiError(httpStatus.NOT_FOUND, `Subcategory with ID ${subcategory_id} not found`);
        }

        const basePrice = parseFloat(subcategory.price || 0);
        let variantPrice = 0;

        if (variant_id) {
          const variant = await Variant.findByPk(variant_id, { transaction: t });
          if (!variant) {
            throw new ApiError(httpStatus.NOT_FOUND, `Variant with ID ${variant_id} not found`);
          }
          variantPrice = parseFloat(variant.price || 0);
        }

        const unitPrice = basePrice;
        const totalPrice = (parseFloat(unitPrice)+parseFloat(variantPrice)) * quantity;

        totalItemAmount += totalPrice;

        await RestaurantOrderItem.create({
          order_id: order.id,
          subcategory_id,
          variant_id: variant_id || null,
          quantity,
          unit_price: unitPrice,
          variant_price:variantPrice || 0,
          total_price: totalPrice,
          notes: item.notes || null,
        }, { transaction: t });
      }
    }

    // === Recalculate pricing ===
    const discountAmount = parseFloat(((totalItemAmount * discount) / 100).toFixed(2));
    const amountAfterDiscount = totalItemAmount;
    const gstAmount = parseFloat(((amountAfterDiscount * tax) / 100).toFixed(2));
    const serviceChargeAmount = parseFloat(((amountAfterDiscount * service_charge) / 100).toFixed(2));
    // const total_amount = amountAfterDiscount + gstAmount + serviceChargeAmount + tip;
    const total_amount = parseFloat(
      (
        parseFloat(amountAfterDiscount) +
        parseFloat(gstAmount) +
        parseFloat(serviceChargeAmount) -
        parseFloat(discountAmount)+
        parseFloat(tip)
      ).toFixed(2)
    );
    
    // === Update RestaurantOrder ===
    await order.update({
      table_id: table_id ?? order.table_id,
      comment: comment ?? order.comment,
      tip,
      discount,
      service_charge,
      tax,
      status: status ?? order.status,
      total_amount,
      order_type,
      guest_type,
      guest_id
    }, { transaction: t });

    // === Update or create TableBooking ===
    const existingBooking = await TableBooking.findOne({
      where: { order_id: order.id },
      transaction: t,
    });

    if (existingBooking) {
      await existingBooking.update({
        table_id: table_id ?? existingBooking.table_id,
        booking_time: booking_time ?? existingBooking.booking_time,
        guest_id: order.guest_id,
        walkin_name: name && name
      }, { transaction: t });
    } else if (table_id) {
      await TableBooking.create({
        table_id,
        guest_id: order.guest_id,
        walkin_name: name,
        status: "booked",
        order_id: order.id,
        booking_time: booking_time ?? new Date(),
      }, { transaction: t });
    }

    // === Update RestaurantFolio ===
    const restaurantFolio = await RestaurantFolio.findOne({
      where: { order_id: order.id },
      transaction: t,
    });

    if (restaurantFolio) {
      await restaurantFolio.update({ status: 'open' }, { transaction: t });

      await RestaurantFolioCharge.destroy({
        where: { folio_id: restaurantFolio.id },
        transaction: t,
      });

      await RestaurantFolioCharge.create({
        folio_id: restaurantFolio.id,
        description: `Updated Restaurant Order #${order.id}`,
        amount: total_amount,
      }, { transaction: t });
    }
    console.log("order", order)

    // === Update Hotel Folio Charges (if hotel guest) ===
    if (order.guest_type === "hotel_guest" && order.guest_id) {
      const folio = await Folio.findOne({ where: { guest_id: order.guest_id }, transaction: t });

      if (folio) {
        const charges = await FolioCharge.findAll({ where: { folio_id: folio.id }, transaction: t });

        for (const charge of charges) {
          if (charge.details && JSON.parse(charge.details)?.order_id === order.id) {
            await charge.destroy({ transaction: t });
          }
        }

        await FolioCharge.create({
          folio_id: folio.id,
          charge_type: "restaurant",
          description: `Updated Restaurant Order for ${name}`,
          unit_price: amountAfterDiscount,
          quantity: 1,
          discount,
          tax_rate: tax,
          amount: total_amount,
          charge_date: booking_time || new Date(),
          is_taxable: true,
          posted_by: null,
          details: JSON.stringify({
            order_id: order.id,
            tip,
            discount,
            service_charge,
            gst_amount: gstAmount,
            gst_rate: tax,
          }),
        }, { transaction: t });

        // Recalculate folio balance
        const updatedCharges = await FolioCharge.findAll({
          where: { folio_id: folio.id },
          transaction: t,
        });

        const totalCharges = updatedCharges.reduce(
          (sum, charge) => sum + parseFloat(charge.total_amount || charge.amount || 0),
          0
        );
        const totalTax = updatedCharges.reduce(
          (sum, charge) => sum + parseFloat(charge.tax_amount || 0),
          0
        );

        const invoices = await Invoice.findAll({
          where: { reservation_id: folio.reservation_id },
          transaction: t,
        });

        const invoiceIds = invoices.map(inv => inv.id);
        let totalPayments = 0;

        if (invoiceIds.length > 0) {
          const payments = await Payments.findAll({
            where: { invoice_id: { [Op.in]: invoiceIds } },
            transaction: t,
          });

          totalPayments = payments.reduce((sum, pay) => sum + parseFloat(pay.amount || 0), 0);
        }

        const balance = totalCharges - totalPayments;

        await Folio.update({
          total_charges: totalCharges,
          total_tax: totalTax,
          total_payments: totalPayments,
          balance,
        }, { where: { id: folio.id }, transaction: t });
      }
    }

    await t.commit();

    const fullOrder = await RestaurantOrder.findByPk(order.id, {
      include: [
        {
          model: RestaurantOrderItem,
          as: "items",
          include: [{ model: Variant, as: "variant" }],
        },
      ],
    });

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Order updated successfully",
      data: fullOrder,
    });
  } catch (err) {
    if (!t.finished) await t.rollback();
    console.error("Update Order Error:", err);
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: err.message,
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await RestaurantOrder.findByPk(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    await RestaurantOrderItem.destroy({ where: { order_id: order.id } });
    await order.destroy();
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { page, limit, order_id } = req.query;
    const filter = {};
    if (order_id) {
      filter.id = order_id;
    }

    const isPaginationEnabled = limit !== undefined && page !== undefined;

    const option = {
      sortBy: [['created_at', 'DESC']],
      include: [
        {
          model: RestaurantOrderItem,
          as: 'items',
          include: [
            {
              model: Subcategory,
              as: 'subcategory',
              include: [
                {
                  model: Category,
                  as: 'category',
                  attributes: ['id', 'name'],
                },
              ],
              attributes: ['id', 'name', 'category_id'],
            },
            {
              model: Variant,
              as: 'variant',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: Guests,
          as: 'guest',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
          required: false,
        },
        {
          model: RestaurantUser,
          as: 'restaurant_user',
          attributes: ['id', 'name', 'email', 'phone'],
          required: false,
        },
        {
          model: RoomNumber,
          as: 'room',
          attributes: ['id', 'room_number', 'floor_number'],
          required: false,
        },
        {
          model: RestaurantTable,
          as: 'table',
          attributes: ['id', 'name'],
          required: false,
        },
        {
          model: TableBooking,
          as: 'booking',
          required: false,
          include: [
            {
              model: RestaurantTable,
              as: 'table',
              attributes: ['id', 'name'],
              required: false,
            },
          ],
        },
      ],
    };

    if (isPaginationEnabled) {
      option.limit = parseInt(limit, 10);
      option.page = parseInt(page, 10);
    }

    const { data, pagination } = await paginate(RestaurantOrder, filter, option);

    const formattedData = data.map(order => {
      const raw = order.toJSON();

      let guestInfo = null;

      if (order.guest_type === 'hotel_guest' && raw.guest) {
        guestInfo = {
          id: raw.guest.id,
          name: `${raw.guest.first_name} ${raw.guest.last_name}`,
          email: raw.guest.email,
          phone: raw.guest.phone,
        };
      } else if (order.guest_type === 'restaurant_guest' && raw.restaurant_user) {
        guestInfo = {
          id: raw.restaurant_user.id,
          name: raw.restaurant_user.name,
          email: raw.restaurant_user.email,
          phone: raw.restaurant_user.phone,
        };
      }

      return {
        ...raw,
        guest_info: guestInfo, 
        guest: undefined,
        restaurant_user: undefined, 
      };
    });

    res.json({ data: formattedData, pagination });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const order = await RestaurantOrder.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === 'cancelled') {
      await t.rollback();
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "Order is already cancelled",
      });
    }

    await order.update({ status: "cancelled" }, { transaction: t });

    await TableBooking.update(
      { status: "cancelled" },
      { where: { order_id: order.id }, transaction: t }
    );

    if (order.guest_id) {
      const folio = await Folio.findOne({
        where: { guest_id: order.guest_id },
        transaction: t,
      });

      if (folio) {
        await safelyAddChargeToFolio(
          folio.id,
          {
            charge_type: "restaurant_refund",
            description: "Cancelled Restaurant Order",
            unit_price: -Math.abs(order.total_amount || 0),
            quantity: 1,
            tax_rate: 0,
            is_taxable: false,
            details: {
              order_id: order.id,
              cancelled: true,
            },
          },
          null,
          t
        );
      }
    }

    await t.commit();

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (err) {
    if (!t.finished) await t.rollback();
    console.error("Cancel Order Error:", err);
    return sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: err.message,
    });
  }
};

const getOrCreateInvoiceForOrder = async (order_id) => {
  const folio = await RestaurantFolio.findOne({
    where: { order_id },
    include: [
      { model: RestaurantFolioCharge, as: 'restaurant_charges' },
      { model: RestaurantInvoice, as: 'restaurant_invoices' }
    ]
  });

  if (!folio) {
    throw new Error('Folio not found for given order');
  }

  // Return existing invoice if exists
  if (folio.restaurant_invoices?.length > 0) {
    return { invoice: folio.restaurant_invoices[0], folio };
  }

  // Calculate total amount
  const total_amount = folio.restaurant_charges.reduce(
    (sum, charge) => sum + parseFloat(charge.amount),
    0
  );

  // Create new invoice
  const invoice = await RestaurantInvoice.create({
    folio_id: folio.id,
    invoice_number: `INV-${Date.now()}`,
    total_amount,
  });

  // Create invoice items
  for (const charge of folio.restaurant_charges) {
    await RestaurantInvoiceItem.create({
      invoice_id: invoice.id,
      description: charge.description,
      quantity: 1,
      unit_price: charge.amount,
      total_price: charge.amount,
    });
  }

  return { invoice, folio };
};

exports.createInvoice = catchAsync(async (req, res) => {
  const { order_id } = req.body;

  try {
    const { invoice, folio } = await getOrCreateInvoiceForOrder(order_id);

    const existing = folio.restaurant_invoices?.[0];
    const message = existing ? 'Invoice already exists for this order' : 'Invoice created successfully';

    return res.status(existing ? 200 : 201).json({
      success: true,
      message,
      data: invoice,
    });
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

exports.createPayment = catchAsync(async (req, res) => {
  const { order_id, method, amount } = req.body;

  try {
    const { invoice, folio } = await getOrCreateInvoiceForOrder(order_id);

    // Check existing payments
    const existingPayments = await RestaurantPayment.findAll({
      where: { invoice_id: invoice.id }
    });

    const totalPaid = existingPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const newTotal = totalPaid + parseFloat(amount);

    console.log("newTotal",newTotal)
    console.log("invoice.total_amount",invoice.total_amount)
    if (newTotal > parseFloat(invoice.total_amount)) {
      return res.status(400).json({ message: 'Payment exceeds invoice total' });
    }

    // Create new payment
    const payment = await RestaurantPayment.create({
      invoice_id: invoice.id,
      method,
      amount,
    });

    // Close folio if fully paid
    if (newTotal >= parseFloat(invoice.total_amount)) {
      await RestaurantFolio.update(
        { status: 'closed' },
        { where: { id: folio.id } }
      );

      await RestaurantOrder.update(
        { status: 'completed' },
        { where: { id: order_id } }
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment,
    });
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});
