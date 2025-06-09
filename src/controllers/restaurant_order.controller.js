const { RestaurantOrder, RestaurantOrderItem, Variant, RestaurantTable, Guests, GuestDetail, TableBooking, sequelize, RestaurantUser, Folio } = require('../models');
const { Op } = require('sequelize');
const paginate = require('../models/plugins/paginate.plugin');
const { safelyAddChargeToFolio } = require('../services/billing.service');
const sendResponse = require('../utils/sendResponse');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

// Create a new order
exports.createOrder = async (req, res) => {
  console.log("req.body", req.body);
  const t = await sequelize.transaction();
  try {
    const {
      table_id,
      guest_id,
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
    } = req.body;

    let guestId = guest_id;
    let folioId = null;
    let guestname = name || "";
    let newGuest = "";
    // Check if guest_id exists in hotel guest_detail table
    if (guest_id) {
      const hotelGuest = await Guests.findByPk(guest_id, { transaction: t });
      guestname = hotelGuest?.first_name + " " + hotelGuest?.last_name;
      if (hotelGuest) {
        const folio = await Folio.findOne({ where: { guest_id }, transaction: t });
        folioId = folio?.id;
        guestId = hotelGuest.id
        console.log("hotelGuest", hotelGuest)
      } else {
        throw new ApiError(httpStatus.NOT_FOUND, "Guest not found")
      }
    } else {
      console.log("create new guest")
      // No guest_id provided, create new guest
      newGuest = await RestaurantUser.create(
        {
          name: name || "Walk-in Guest",
          email: email || null,
          phone: phone || null,
        },
        { transaction: t }
      );
      guestname = name;
    }

    let totalItemAmount = 0;
    if (order_items?.length > 0) {
      for (const item of order_items) {
        const totalPrice = item.unit_price * item.quantity;
        totalItemAmount += totalPrice;
      }
    }
    const total_amount = totalItemAmount + tip + service_charge + tax - discount;

    // Create restaurant order
    const order = await RestaurantOrder.create(
      {
        table_id,
        guest_id: guestId || null,
        restaurant_user_id: newGuest?.id || null,
        comment: comment || null,
        tip,
        discount,
        service_charge,
        total_amount,
        tax,
        status: "open",
      },
      { transaction: t }
    );
    console.log("order", order);

    if (table_id) {
      const bookingTable = await TableBooking.create({
        table_id,
        guest_id: guestId || newGuest.id,
        walkin_name: guestname,
        status: "booked",
        order_id: order.id,
        booking_time: date_time
      })
      console.log("bookingTable", bookingTable);
    }

    // Create order items
    if (order_items?.length > 0) {
      for (const item of order_items) {
        const totalPrice = item.unit_price * item.quantity;
        totalItemAmount += totalPrice;
        console.log("order item created 1")
        await RestaurantOrderItem.create(
          {
            ...item,
            order_id: order.id,
            total_price: totalPrice,
          },
          { transaction: t }
        );
      }
      console.log("bookingTable", order_items);
    }
    console.log("folio id console", folioId)
    // If hotel guest, add restaurant charge to folio
    if (folioId) {
      console.log("folioId", folioId);

      await safelyAddChargeToFolio(
        folioId,
        {
          charge_type: "restaurant",
          description: "Restaurant Order",
          unit_price: totalItemAmount + tip + service_charge + tax - discount,
          quantity: 1,
          tax_rate: 0,
          is_taxable: false,
          details: {
            order_id: order.id,
            tip,
            discount,
            service_charge,
            tax,
          },
        },
        null,
        t
      );
    }

    await t.commit();

    // Fetch full order with items
    // const fullOrder = await RestaurantOrder.findByPk(order.id, {
    //   include: [{ model: RestaurantOrderItem, as: "items", include: [{ model: Variant, as: "variant" }] }],
    // });
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Order Created successfully",
    });
  } catch (err) {
    if (!t.finished) {
      await t.rollback();
    }
    // await t.rollback();
    console.error("Create Order Error:", err);
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
      name,email,phone,
      date_time:booking_time
    } = req.body;
console.log("date_time",booking_time)

    const order = await RestaurantOrder.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: false,
        message: "Order not found",
      });
    }
    
    let totalItemAmount = 0;

    if (order.guest_id) {
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
    } else if (order.restaurant_user_id) {
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

    // Replace order items if provided
    if (Array.isArray(order_items)) {
      await RestaurantOrderItem.destroy({
        where: { order_id: order.id },
        transaction: t,
      });

      for (const item of order_items) {
        const totalPrice = item.unit_price * item.quantity;
        totalItemAmount += totalPrice;

        await RestaurantOrderItem.create(
          {
            ...item,
            order_id: order.id,
            total_price: totalPrice,
          },
          { transaction: t }
        );
      }
    }

    // Calculate new total_amount
    const total_amount = totalItemAmount + tip + service_charge + tax - discount;
    const originalTableId = order.table_id;

    // Update RestaurantOrder
    await order.update(
      {
        table_id: table_id ?? order.table_id,
        comment: comment ?? order.comment,
        tip,
        discount,
        service_charge,
        tax,
        status: status ?? order.status,
        total_amount,
      },
      { transaction: t }
    );

    // Update TableBooking if table_id is changed
    // if (table_id && table_id !== originalTableId) {
    //   const existingBooking = await TableBooking.findOne({
    //     where: { order_id: order.id },
    //     transaction: t,
    //   });
    //   console.log("existingBooking",existingBooking)
    //   console.log("table_id : ",table_id)

    //   if (existingBooking) {
    //     await existingBooking.update(
    //       {
    //         table_id,
    //         booking_time: booking_time ?? existingBooking.booking_time,
    //       },
    //       { transaction: t }
    //     );
    //   } else {
    //     await TableBooking.create(
    //       {
    //         table_id,
    //         guest_id: order.guest_id || order.restaurant_user_id,
    //         walkin_name: name, // You may populate this using guest lookup
    //         status: "booked",
    //         order_id: order.id,
    //         booking_time: booking_time ?? new Date(),
    //       },
    //       { transaction: t }
    //     );
    //   }
    // }
    const existingBooking = await TableBooking.findOne({
      where: { order_id: order.id },
      transaction: t,
    });
    
    if (existingBooking) {
      await existingBooking.update(
        {
          table_id: table_id ?? existingBooking.table_id,
          booking_time: booking_time ?? existingBooking.booking_time,
        },
        { transaction: t }
      );
    } else if (table_id) {
      await TableBooking.create(
        {
          table_id,
          guest_id: order.guest_id || order.restaurant_user_id,
          walkin_name: name,
          status: "booked",
          order_id: order.id,
          booking_time: booking_time ?? new Date(),
        },
        { transaction: t }
      );
    }

    // Update folio charge if hotel guest
    if (order.guest_id) {
      const folio = await Folio.findOne({
        where: { guest_id: order.guest_id },
        transaction: t,
      });

      if (folio) {
        await safelyAddChargeToFolio(
          folio.id,
          {
            charge_type: "restaurant",
            description: "Updated Restaurant Order",
            unit_price: total_amount,
            quantity: 1,
            tax_rate: 0,
            is_taxable: false,
            details: {
              order_id: order.id,
              tip,
              discount,
              service_charge,
              tax,
            },
          },
          null,
          t
        );
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
    console.log("orifer", order_id)

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
          include: [{ model: Variant, as: 'variant' }],
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
          model: TableBooking,
          as: 'booking',
          required: false,
          include: [
            {
              model: Guests,
              as: 'guest',
              attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
            },
            {
              model: RestaurantTable,
              as: 'table',
              attributes: ['id', 'name'],
            }
          ]
        }
      ]//d4558428-bb9f-43ac-a09b-4fb676ba53f9
      // //397cf39c-b89f-4a7d-8eca-2b9c40744345
    };

    if (isPaginationEnabled) {
      option.limit = parseInt(limit, 10);
      option.page = parseInt(page, 10);
    }

    const { data, pagination } = await paginate(
      RestaurantOrder,
      filter,
      option
    );

    res.json({
      data, pagination
    });
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

    // Check if order is already cancelled
    if (order.status === 'cancelled') {
      await t.rollback();
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "Order is already cancelled",
      });
    }

    // Update order status
    await order.update({ status: "cancelled" }, { transaction: t });

    // Update TableBooking if exists
    await TableBooking.update(
      { status: "cancelled" },
      {
        where: { order_id: order.id },
        transaction: t,
      }
    );

    // Optionally update folio if guest exists
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
            unit_price: -order.total_amount,
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

    // Check if order is already cancelled
    if (order.status === 'cancelled') {
      await t.rollback();
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "Order is already cancelled",
      });
    }

    // Update order status
    await order.update({ status: "cancelled" }, { transaction: t });

    // Update TableBooking if exists
    await TableBooking.update(
      { status: "cancelled" },
      {
        where: { order_id: order.id },
        transaction: t,
      }
    );

    // Optionally update folio if guest exists
    if (order.guest_id) {
      const folio = await Folio.findOne({
        where: { guest_id: order.guest_id },
        transaction: t,
      });

      if (folio) {
        await safelyAddChargeToFolio(
          folio.id,
          {
            charge_type: "restaurant_cancelled",
            description: "Cancelled Restaurant Order",
            unit_price: -order.total_amount,
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
