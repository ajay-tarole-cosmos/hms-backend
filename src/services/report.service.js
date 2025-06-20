const { Op, fn, col, literal } = require("sequelize")
const { getDateFilter } = require("../utils/dateFilters")
const { Reservation, Guests, Folio, Payments, FolioCharge, RoomNumber, Room, RestaurantOrderItem, RestaurantOrder, sequelize, Invoice, InvoiceItem, RoomPricing, InventoryItem, Department, DepartmentCategory } = require("../models")
const ProcurementRequestItem = require("../models/procurementRequestItem.model")
const TableBooking = require('../models/tableBooking.model')
const RestaurantInvoice = require('../models/restaurant_invoice')

const getFrontOfficeReports = async ({ filterType, startDate, endDate }) => {
  const dateFilter = getDateFilter(filterType, startDate, endDate)

  // 1. ARRIVAL LIST (Check-ins in date range)
  const arrivals = await Reservation.findAll({
    where: {
      check_in_date_time: dateFilter,
      booking_status: { [Op.ne]: "cancelled" },
    },
    include: [{ model: Guests, as: "guest" }],
    order: [["check_in_date_time", "ASC"]],
  })
  console.log("arricval", arrivals)

  // 2. DEPARTURE LIST (Check-outs in date range)
  const departures = await Reservation.findAll({
    where: {
      check_out_date_time: dateFilter,
      booking_status: { [Op.ne]: "cancelled" },
    },
    include: [{ model: Guests, as: "guest" }],
    order: [["check_out_date_time", "ASC"]],
  })
  console.log("departures", departures);

  // 3. IN-HOUSE GUESTS (Guests currently checked in)
  const now = new Date()
  const inHouseGuests = await Reservation.findAll({
    where: {
      booking_status: "check_in",
      check_in_date_time: { [Op.lte]: now },
      check_out_date_time: { [Op.gte]: now },
    },
    include: [{ model: Guests, as: "guest" }],
  })

  // 4. FOLIO SUMMARY (Bills per reservation in date filter)
  const guestFolios = await Reservation.findAll({
    where: {
      check_in_date_time: dateFilter,
    },
    include: [
      { model: Guests, as: "guest" },
      {
        model: Folio,
        as: "folios",
        include: [
          {
            model: FolioCharge,
            as: "charges",
          },
        ],
      },
      { model: Payments, as: "payments" },
    ],
  })

  return {
    arrival_list: arrivals,
    departure_list: departures,
    in_house_guests: inHouseGuests,
    guest_folios: guestFolios,
  }
}

const getFinancialReports = async ({ filterType, startDate, endDate, totalRooms }) => {
  const dateFilter = getDateFilter(filterType, startDate, endDate)

  // Daily Revenue Report
  const dailyRevenue = await Reservation.findAll({
    where: {
      check_in_date_time: dateFilter,
      booking_status: { [Op.in]: ["check_in", "check_out"] },
    },
    attributes: [
      [fn("DATE", col("check_in_date_time")), "date"],
      [fn("SUM", col("total_amount")), "total_revenue"],
      [fn("COUNT", col("id")), "total_bookings"],
    ],
    group: [literal("DATE(check_in_date_time)")],
    order: [[literal("DATE(check_in_date_time)"), "ASC"]],
    raw: true,
  })

  // Occupancy & ADR Summary
  const reservations = await Reservation.findAll({
    where: {
      check_in_date_time: dateFilter,
      booking_status: { [Op.in]: ["check_in", "check_out"] },
    },
    attributes: ["total_rooms", "total_amount"],
    raw: true,
  })

  const totalOccupiedRooms = reservations.reduce((sum, r) => sum + (r.total_rooms || 0), 0)
  const totalRevenue = reservations.reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0)

  const occupancyRate = totalRooms > 0 ? ((totalOccupiedRooms / (totalRooms * reservations.length)) * 100).toFixed(2) : "0.00"
  const average_daily_rate = totalOccupiedRooms > 0 ? (totalRevenue / totalOccupiedRooms).toFixed(2) : "0.00"

  return {
    daily_revenue_report: dailyRevenue,
    summary: {
      total_revenue: totalRevenue.toFixed(2),
      total_occupied_rooms: totalOccupiedRooms,
      occupancy_rate: `${occupancyRate}%`,
      average_daily_rate,
    },
  }
}

const getPOSReports = async ({ filterType, startDate, endDate }) => {
    const dateFilter = getDateFilter(filterType, startDate, endDate);

    const paymentSummary = await Payments.findAll({
      where: {
        payment_date: dateFilter,
        status: 'completed',
      },
      attributes: [
        'payment_method',
        [fn('SUM', col('amount')), 'total_amount'],
      ],
      group: ['payment_method'],
      raw: true,
    });

    const itemSales = await RestaurantOrderItem.findAll({
      include: {
        model: RestaurantOrder,
        as:"order",
        attributes: [],
        where: {
          created_at: dateFilter,
          status: 'closed',
        },
      },
      attributes: [
        'order_id',
        [fn('SUM', col('quantity')), 'total_quantity'],
        [fn('SUM', literal('quantity * unit_price')), 'total_value'],
      ],
      group: ['order_id'],
      raw: true,
    });

    return {
      payment_summary_by_method: paymentSummary,
      item_sales_summary: itemSales,
    };
  };


  const StockLevelReport = async (filters = {}) => {
    try {
      const stockLevels = await InventoryItem.findAll({
        include: [
          {
            model: Department,
            attributes: ['name'],
            as: 'department'
          },
          {
            model: DepartmentCategory,
            attributes: ['name'],
            as: 'category'
          }
        ],
        attributes: [
          'id',
          'name',
          'quantity',
          'unit',
          // 'minimum_quantity',
          // 'maximum_quantity',
          'department_id',
          'category_id'
        ],
        where: filters
      });
  
      const data = stockLevels.map(item => ({
        item_id: item.id,
        item_name: item.name,
        current_quantity: item.quantity,
        unit: item.unit,
        department: item.department?.name,
        category: item.category?.name,
        minimum_quantity: item.minimum_quantity,
        maximum_quantity: item.maximum_quantity,
        status:
          item.quantity <= item.minimum_quantity ? 'Low Stock' :
          item.quantity >= item.maximum_quantity ? 'Overstocked' :
          'Normal'
      }));
  
      return { success: true, data };
    } catch (error) {
      console.error('Stock Level Report Error:', error);
      throw new Error(error.message);
    }
  };

  const generateExpenseAnalysisReport = async (startDate, endDate, category = null) => {
    try {
      const whereClause = {
        created_at: {
          [Op.between]: [startDate, endDate],
        },
      };
  
      if (category) {
        whereClause.category = category;
      }
      console.log("enter ")
  
      const [invoiceExpenses, folioExpenses] = await Promise.all([
        Invoice.findAll({
          include: [
            {
              model: InvoiceItem,
              as:"items",
              // attributes: ['total_price', 'description', 'createdAt'],
            },
          ],
          where: whereClause,
        }),
        Folio.findAll({
          include: [
            {
              model: FolioCharge,
              as:"charges",
              // attributes: ['amount', 'description','],
            },
          ],
          where: whereClause,
        }),
      ]);
      console.log("envoice ",invoiceExpenses, folioExpenses)

      const analysis = {
        total_expenses: 0,
        expenses_by_category: {},
        expenses_by_date: {},
        top_expenses: [],
      };
  
      // Process invoice expenses
      invoiceExpenses.forEach(invoice => {
        invoice.items.forEach(item => {
          processExpense(item, analysis);
        });        
      });
  
      // Process folio expenses
      folioExpenses.forEach(folio => {
        folio.charges.forEach(charge => {
          processExpense(charge, analysis);
        });
        
      });
  
      // Sort top expenses by amount
      analysis.top_expenses.sort((a, b) => b.amount - a.amount);
      analysis.top_expenses = analysis.top_expenses.slice(0, 10);
  
      return { success: true, data: analysis };
    } catch (error) {
      console.error('Expense Analysis Report Error:', error);
      throw new Error(error.message);
    }
  };
  
  const processExpense = (item, analysis) => {
    // const amount = parseFloat(item.amount ?item.amount : item.total_price);
    const amount = parseFloat(item.amount ? item.amount : item.total_price);
    // const category = item.category || 'Uncategorized';
    const category = item?.category || item?.item_type || 'Uncategorized';

    const date = item.created_at?.toISOString().split('T')[0] || 'Unknown';
  
    analysis.total_expenses += amount;
  
    // By category
    if (!analysis.expenses_by_category[category]) {
      analysis.expenses_by_category[category] = 0;
    }
    analysis.expenses_by_category[category] += amount;
  
    // By date
    if (!analysis.expenses_by_date[date]) {
      analysis.expenses_by_date[date] = 0;
    }
    analysis.expenses_by_date[date] += amount;
  
    // For top expenses
    analysis.top_expenses.push({
      amount,
      description: item.description,
      category,
      date,
    });
  };
  


  //profit loss
 const generateOperationalPLReport = async (startDate, endDate) => {
  try {
    const whereClause = {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    };
    console.log("enter pl report")

    // Revenue
    const [roomRevenue, invoiceRevenue, folioRevenue] = await Promise.all([
      getRoomRevenue(startDate, endDate),
      getInvoiceRevenue(whereClause),
      getFolioRevenue(whereClause),
    ]);
console.log("roomRevenue, invoiceRevenue, folioRevenue",roomRevenue, invoiceRevenue, folioRevenue)
    // Expenses
    const expenses = await getExpenses(whereClause);
console.log("expenses",expenses)
    const totalRevenue = roomRevenue + invoiceRevenue + folioRevenue;
    const totalExpenses = expenses.total;
    const grossProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return {
      success: true,
      data: {
        revenue: {
          room_revenue: roomRevenue,
          invoice_revenue: invoiceRevenue,
          folio_revenue: folioRevenue,
          total_revenue: totalRevenue,
        },
        expenses,
        profit: {
          gross_profit: grossProfit,
          profit_margin: profitMargin,
        },
        period: {
          start_date: startDate,
          end_date: endDate,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

const getRoomRevenue = async (startDate, endDate) => {
  const rooms = await Room.findAll({
    include: [
      {
        model: RoomPricing,
        attributes: ["discount_value", "valid_date_from", "valid_date_to"],
        where: {
          [Op.or]: [
            {
              valid_date_from: {
                [Op.between]: [startDate, endDate],
              },
            },
            {
              valid_date_to: {
                [Op.between]: [startDate, endDate],
              },
            },
            {
              valid_date_from: {
                [Op.lte]: startDate,
              },
              valid_date_to: {
                [Op.gte]: endDate,
              },
            },
          ],
        },
      },
    ],
  });

  console.log("rooms", rooms);

  const total = rooms.reduce((total, room) => {
    const pricingTotal = room.RoomPricings.reduce(
      (sum, pricing) => sum + parseFloat(pricing.discount_value || 0),
      0
    );
    return total + pricingTotal;
  }, 0);

  return total;
};

const getInvoiceRevenue = async (whereClause) => {
  const invoices = await Invoice.findAll({
    include: [
      {
        model: InvoiceItem,
        as:"items",
        attributes: ["total_price"],
      },
    ],
    where: whereClause,
  });
console.log("\invoices",invoices)
  return invoices.reduce((total, invoice) => {
    const itemsTotal = invoice.InvoiceItems.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
    return total + itemsTotal;
  }, 0);
};

const getFolioRevenue = async (whereClause) => {
  const folios = await Folio.findAll({
    include: [
      {
        model: FolioCharge,
        as: "charges" ,
        attributes: ["amount"],
      },
    ],
    where: whereClause,
  });
console.log("folio",folios)
  return folios.reduce((total, folio) => {
    const chargesTotal = folio.FolioCharges.reduce((sum, charge) => sum + parseFloat(charge.amount), 0);
    return total + chargesTotal;
  }, 0);
};

const getExpenses = async (whereClause) => {
  const [invoiceExpenses, folioExpenses] = await Promise.all([
    Invoice.findAll({
      include: [
        {
          model: InvoiceItem,
          attributes: ["amount", "item_type"],
          as: "items"
        },
      ],
      where: whereClause,
    }),
    Folio.findAll({
      include: [
        {
          model: FolioCharge,
          attributes: ["amount", "item_type"],
          as: "charges"
        },
      ],
      where: whereClause,
    }),
  ]);

  const expenses = {
    total: 0,
    by_type: {}, // instead of category
  };

  // Invoice items
  invoiceExpenses.forEach((invoice) => {
    invoice.items.forEach((item) => {
      const amount = parseFloat(item.amount);
      const type = item.item_type || "Uncategorized";

      expenses.total += amount;
      expenses.by_type[type] = (expenses.by_type[type] || 0) + amount;
    });
  });

  // Folio charges
  folioExpenses.forEach((folio) => {
    folio.charges.forEach((charge) => {
      const amount = parseFloat(charge.amount);
      const type = charge.item_type || "Uncategorized";

      expenses.total += amount;
      expenses.by_type[type] = (expenses.by_type[type] || 0) + amount;
    });
  });

  return expenses;
};

function getPeriodRange(period = 'today') {
  const now = new Date();
  let start, end;
  if (period === 'today') {
    start = new Date();
    start.setHours(0, 0, 0, 0);
    end = new Date();
    end.setHours(23, 59, 59, 999);
  } else if (period === 'yesterday') {
    start = new Date();
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setHours(23, 59, 59, 999);
  }
  return { start, end };
}

async function getDashboardReport() {
  // Today
  const { start: todayStart, end: todayEnd } = getPeriodRange('today');
  // Previous (yesterday)
  const { start: prevStart, end: prevEnd } = getPeriodRange('yesterday');

  // Room Bookings (Reservations)
  const todayBookings = await Reservation.count({
    where: {
      created_at: { [Op.between]: [todayStart, todayEnd] },
      booking_status: { [Op.ne]: 'cancelled' }
    }
  });
  const prevBookings = await Reservation.count({
    where: {
      created_at: { [Op.between]: [prevStart, prevEnd] },
      booking_status: { [Op.ne]: 'cancelled' }
    }
  });

  // Room Revenue (Invoices)
  const todayAmount = await Invoice.sum('total_amount', {
    where: { created_at: { [Op.between]: [todayStart, todayEnd] } }
  }) || 0;
  const prevAmount = await Invoice.sum('total_amount', {
    where: { created_at: { [Op.between]: [prevStart, prevEnd] } }
  }) || 0;

  // Total Customers (unique guests with reservations today)
  const todayCustomers = await Reservation.count({
    where: {
      created_at: { [Op.between]: [todayStart, todayEnd] },
      booking_status: { [Op.ne]: 'cancelled' }
    },
    distinct: true,
    col: 'guest_id'
  });
  const prevCustomers = await Reservation.count({
    where: {
      created_at: { [Op.between]: [prevStart, prevEnd] },
      booking_status: { [Op.ne]: 'cancelled' }
    },
    distinct: true,
    col: 'guest_id'
  });

  // Calculate percentage changes
  function percentChange(today, prev) {
    if (!prev) return today ? 100 : 0;
    return ((today - prev) / prev * 100).toFixed(2);
  }

  return {
    todayBookings,
    bookingChange: percentChange(todayBookings, prevBookings),
    todayAmount,
    amountChange: percentChange(todayAmount, prevAmount),
    todayCustomers,
    customerChange: percentChange(todayCustomers, prevCustomers),
    todayRevenue: todayAmount, // Revenue is same as amount for rooms
    revenueChange: percentChange(todayAmount, prevAmount)
  };
}

module.exports = {
  getFrontOfficeReports, 
  getFinancialReports, 
  getPOSReports,
  StockLevelReport,
  generateExpenseAnalysisReport,
  generateOperationalPLReport,
  getDashboardReport
};
