const { InventoryItem, Department, DepartmentCategory } = require('../models');

class StockLevelReport {
    static async generateReport(filters = {}) {
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
                    'minimum_quantity',
                    'maximum_quantity',
                    'department_id',
                    'category_id'
                ],
                where: filters
            });

            return {
                success: true,
                data: stockLevels.map(item => ({
                    item_id: item.id,
                    item_name: item.name,
                    current_quantity: item.quantity,
                    unit: item.unit,
                    department: item.department?.name,
                    category: item.category?.name,
                    minimum_quantity: item.minimum_quantity,
                    maximum_quantity: item.maximum_quantity ,
                    status: item.quantity <= (item.minimum_quantity ) ? 'Low Stock' : 
                           item.quantity >= (item.maximum_quantity )? 'Overstocked' : 'Normal'
                }))
            };
        } catch (error) {
            console.error('Stock Level Report Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = StockLevelReport; 