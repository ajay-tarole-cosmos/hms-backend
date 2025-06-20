const { Invoice, InvoiceItem, Folio, FolioCharge, Room, RoomPricing } = require('../models');
const { Op } = require('sequelize');
const RoomNumber = require('../models/roomNumber.model');

class OperationalPLReport {
    static async generateReport() {
        try {
            console.log("enteoprknjf dmns")
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + daysAhead);
            const whereClause = {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            };

            // Get all revenue sources
            const [roomRevenue, invoiceRevenue, folioRevenue] = await Promise.all([
                this.getRoomRevenue(startDate, endDate),
                // this.getInvoiceRevenue(whereClause),
                // this.getFolioRevenue(whereClause)
            ]);

            console.log("roomRevenue, invoiceRevenue, folioRevenue",roomRevenue, invoiceRevenue, folioRevenue)
            // Get all expenses
            const expenses = await this.getExpenses(whereClause);

            // Calculate operational metrics
            const totalRevenue = roomRevenue + invoiceRevenue + folioRevenue;
            const totalExpenses = expenses.total;
            const grossProfit = totalRevenue - totalExpenses;
            const profitMargin = (grossProfit / totalRevenue) * 100;

            return {
                success: true,
                data: {
                    revenue: {
                        room_revenue: roomRevenue,
                        invoice_revenue: invoiceRevenue,
                        folio_revenue: folioRevenue,
                        total_revenue: totalRevenue
                    },
                    expenses: expenses,
                    profit: {
                        gross_profit: grossProfit,
                        profit_margin: profitMargin
                    },
                    period: {
                        start_date: startDate,
                        end_date: endDate
                    }
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async getRoomRevenue(startDate, endDate) {
        const rooms = await Room.findAll({
            include: [{
                model: RoomNumber,
                where: {
                    date: {
                        [Op.between]: [startDate, endDate]
                    }
                }
            }]
        });

        return rooms.reduce((total, room) => {
            return total + room.RoomPricings.reduce((roomTotal, pricing) => {
                return roomTotal + parseFloat(pricing.price);
            }, 0);
        }, 0);
    }

    // static async getInvoiceRevenue(whereClause) {
    //     const invoices = await Invoice.findAll({
    //         include: [{
    //             model: InvoiceItem,
    //             attributes: ['amount']
    //         }],
    //         where: whereClause
    //     });

    //     return invoices.reduce((total, invoice) => {
    //         return total + invoice.InvoiceItems.reduce((invoiceTotal, item) => {
    //             return invoiceTotal + parseFloat(item.amount);
    //         }, 0);
    //     }, 0);
    // }

    // static async getFolioRevenue(whereClause) {
    //     const folios = await Folio.findAll({
    //         include: [{
    //             model: FolioCharge,
    //             attributes: ['amount']
    //         }],
    //         where: whereClause
    //     });

    //     return folios.reduce((total, folio) => {
    //         return total + folio.FolioCharges.reduce((folioTotal, charge) => {
    //             return folioTotal + parseFloat(charge.amount);
    //         }, 0);
    //     }, 0);
    // }

    // static async getExpenses(whereClause) {
    //     const [invoiceExpenses, folioExpenses] = await Promise.all([
    //         Invoice.findAll({
    //             include: [{
    //                 model: InvoiceItem,
    //                 attributes: ['amount', 'category']
    //             }],
    //             where: whereClause
    //         }),
    //         Folio.findAll({
    //             include: [{
    //                 model: FolioCharge,
    //                 attributes: ['amount', 'category']
    //             }],
    //             where: whereClause
    //         })
    //     ]);

    //     const expenses = {
    //         total: 0,
    //         by_category: {}
    //     };

    //     // Process invoice expenses
    //     invoiceExpenses.forEach(invoice => {
    //         invoice.InvoiceItems.forEach(item => {
    //             const amount = parseFloat(item.amount);
    //             const category = item.category || 'Uncategorized';
                
    //             expenses.total += amount;
    //             expenses.by_category[category] = (expenses.by_category[category] || 0) + amount;
    //         });
    //     });

    //     // Process folio expenses
    //     folioExpenses.forEach(folio => {
    //         folio.FolioCharges.forEach(charge => {
    //             const amount = parseFloat(charge.amount);
    //             const category = charge.category || 'Uncategorized';
                
    //             expenses.total += amount;
    //             expenses.by_category[category] = (expenses.by_category[category] || 0) + amount;
    //         });
    //     });

    //     return expenses;
    // }
}

module.exports = OperationalPLReport; 