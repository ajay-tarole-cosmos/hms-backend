const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/postgres.js");

class InventoryItem extends Model {}

InventoryItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    department_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    minimum_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    maximum_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    }
  },
  {
    sequelize,
    modelName: "InventoryItem",
    tableName: "inventory_items",
    timestamps: true,
    hooks: {
      beforeUpdate: async (instance, options) => {
        try {
          if (instance.changed('quantity')) {
            console.log('Quantity changed, recording history...');
            const previousQuantity = instance.previous('quantity') || 0;
            const newQuantity = instance.get('quantity');
            const changeAmount = Math.abs(newQuantity - previousQuantity);
            const changeType = newQuantity > previousQuantity ? 'increase' : 'decrease';

            // Get the source type and ID from options if available
            const sourceType = options.sourceType || 'manual';
            const sourceId = options.sourceId || null;
            const notes = options.notes || null;
            const metadata = options.metadata || {};
            const changedBy = options.user?.id || null;
            const referenceNumber = metadata.invoiceNumber || metadata.requestId || null;

            console.log('Recording history with:', {
              previousQuantity,
              newQuantity,
              changeAmount,
              changeType,
              sourceType,
              sourceId,
              notes,
              metadata,
              changedBy,
              referenceNumber
            });

            // Create history record using raw query to avoid circular dependency
            await sequelize.query(`
              INSERT INTO inventory_consumption_history 
              (id, item_id, previous_quantity, new_quantity, change_amount, change_type, 
               source_type, source_id, notes, metadata, changed_by, reference_number, 
               created_at, updated_at)
              VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
            `, {
              bind: [
                instance.id,
                previousQuantity,
                newQuantity,
                changeAmount,
                changeType,
                sourceType,
                sourceId,
                notes,
                JSON.stringify(metadata),
                changedBy,
                referenceNumber
              ],
              type: sequelize.QueryTypes.INSERT
            });

            console.log('History recorded successfully');
          }
        } catch (error) {
          console.error('Error in beforeUpdate hook:', error);
          throw error;
        }
      }
    }
  }
);

// Define associations
InventoryItem.associate = (models) => {
  InventoryItem.belongsTo(models.Department, {
    foreignKey: "department_id",
    as: "department",
  });

  InventoryItem.belongsTo(models.DepartmentCategory, {
    foreignKey: "category_id",
    as: "category",
  });

  InventoryItem.hasMany(models.ProcurementRequestItem, {
    foreignKey: "item_id",
    as: "procurementRequestItems",
  });

  InventoryItem.hasMany(models.InventoryConsumptionHistory, {
    foreignKey: 'item_id',
    as: 'consumptionHistory'
  });
};

module.exports = InventoryItem;
