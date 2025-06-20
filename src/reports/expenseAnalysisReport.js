const { Invoice, InvoiceItem, Folio, FolioCharge } = require('../models');
const { Op } = require('sequelize');

class ExpenseAnalysisReport {
    static async generateReport(startDate, endDate, category = null) {
        try {
            const whereClause = {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            };

            if (category) {
                whereClause.category = category;
            }

            // Get all expenses from invoices and folio charges
            const [invoiceExpenses, folioExpenses] = await Promise.all([
                Invoice.findAll({
                    include: [{
                        model: InvoiceItem,
                        attributes: ['amount', 'description', 'category']
                    }],
                    where: whereClause
                }),
                Folio.findAll({
                    include: [{
                        model: FolioCharge,
                        attributes: ['amount', 'description', 'category']
                    }],
                    where: whereClause
                })
            ]);

            // Combine and analyze expenses
            const expenseAnalysis = {
                total_expenses: 0,
                expenses_by_category: {},
                expenses_by_date: {},
                top_expenses: []
            };

            // Process invoice expenses
            invoiceExpenses.forEach(invoice => {
                invoice.InvoiceItems.forEach(item => {
                    this.processExpense(item, expenseAnalysis);
                });
            });

            // Process folio expenses
            folioExpenses.forEach(folio => {
                folio.FolioCharges.forEach(charge => {
                    this.processExpense(charge, expenseAnalysis);
                });
            });

            // Sort top expenses
            expenseAnalysis.top_expenses.sort((a, b) => b.amount - a.amount);
            expenseAnalysis.top_expenses = expenseAnalysis.top_expenses.slice(0, 10);

            return {
                success: true,
                data: expenseAnalysis
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    static processExpense(item, analysis) {
        const amount = parseFloat(item.amount);
        const category = item.category || 'Uncategorized';
        const date = item.createdAt.toISOString().split('T')[0];

        // Update total expenses
        analysis.total_expenses += amount;

        // Update category expenses
        if (!analysis.expenses_by_category[category]) {
            analysis.expenses_by_category[category] = 0;
        }
        analysis.expenses_by_category[category] += amount;

        // Update date expenses
        if (!analysis.expenses_by_date[date]) {
            analysis.expenses_by_date[date] = 0;
        }
        analysis.expenses_by_date[date] += amount;

        // Add to top expenses
        analysis.top_expenses.push({
            amount,
            description: item.description,
            category,
            date
        });
    }
}

module.exports = ExpenseAnalysisReport; 