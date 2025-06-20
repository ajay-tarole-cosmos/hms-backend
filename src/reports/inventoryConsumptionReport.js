const { ProcurementItem, DepartmentInventoryItem, ProcurementRequestItem } = require('../models');
const { Op } = require('sequelize');

class InventoryConsumptionReport {
    static async generateReport(startDate, endDate, departmentId = null) {
        try {
            const whereClause = {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            };

            if (departmentId) {
                whereClause.department_id = departmentId;
            }

            const consumptionData = await ProcurementRequestItem.findAll({
                include: [{
                    model: ProcurementItem,
                    attributes: ['name', 'unit', 'category']
                }],
                attributes: [
                    'id',
                    'quantity',
                    'department_id',
                    'createdAt'
                ],
                where: whereClause
            });

            // Group consumption by item
            const consumptionSummary = consumptionData.reduce((acc, item) => {
                const key = item.ProcurementItem.name;
                if (!acc[key]) {
                    acc[key] = {
                        item_name: key,
                        total_consumed: 0,
                        unit: item.ProcurementItem.unit,
                        category: item.ProcurementItem.category,
                        consumption_history: []
                    };
                }
                acc[key].total_consumed += item.quantity;
                acc[key].consumption_history.push({
                    date: item.createdAt,
                    quantity: item.quantity,
                    department_id: item.department_id
                });
                return acc;
            }, {});

            return {
                success: true,
                data: Object.values(consumptionSummary)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = InventoryConsumptionReport; 