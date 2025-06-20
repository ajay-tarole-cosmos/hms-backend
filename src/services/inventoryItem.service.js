// services/inventoryItem.service.js
const { Op } = require('sequelize');
const { InventoryItem, Category, Department, DepartmentCategory } = require('../models');
const paginate = require("../models/plugins/paginate.plugin");
const { sequelize } = require('../config/postgres.js');

exports.create = async payload => {
  const check = await DepartmentCategory.findByPk(payload.category_id);
  if (!check) {
    throw new Error('Invalid category_id');
  }
  
  // Ensure quantity is a number
  if (payload.quantity) {
    payload.quantity = parseInt(payload.quantity, 10);
  }
  
  const data = await InventoryItem.create(payload);
  return data;
};

exports.findAll = async query => {
  const { page, limit, sortBy = [['created_at', 'DESC']] } = query;
  return paginate(
    InventoryItem,
    {},
    {
      page,
      limit,
      sortBy,
      include: [{ model: DepartmentCategory, as: 'category' }],
    }
  );
};

exports.findById = async id =>
  InventoryItem.findByPk(id, { include: ['category'] });

exports.update = async (id, payload, sourceInfo = {}) => {
  const transaction = await sequelize.transaction();
  try {
    // Get current item to check if quantity changed
    const currentItem = await InventoryItem.findByPk(id, { transaction });
    if (!currentItem) {
      throw new Error('Inventory item not found');
    }

    // Create a copy of the payload for updates
    const updateData = { ...payload };

    // If quantity is being updated, ensure it's a number and add source tracking info
    if (updateData.quantity !== undefined) {
      updateData.quantity = parseInt(updateData.quantity, 10);
      if (isNaN(updateData.quantity)) {
        throw new Error('Invalid quantity value');
      }

      // Only proceed with update if quantity actually changed
      if (updateData.quantity !== currentItem.quantity) {
        console.log('Updating quantity from', currentItem.quantity, 'to', updateData.quantity);
        
        // Update the item with source tracking info
        await currentItem.update(updateData, {
          sourceType: sourceInfo.sourceType || 'manual',
          sourceId: sourceInfo.sourceId,
          notes: sourceInfo.notes || `Manual quantity update to ${updateData.quantity}`,
          metadata: sourceInfo.metadata || {},
          user: sourceInfo.user,
          transaction
        });
      }
    } else {
      // For non-quantity updates, just update normally
      await currentItem.update(updateData, { transaction });
    }

    await transaction.commit();
    return currentItem.reload();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.recordConsumption = async (id, quantity, userId, notes = '') => {
  const transaction = await sequelize.transaction();
  try {
    const item = await InventoryItem.findByPk(id, { transaction });
    if (!item) {
      throw new Error('Inventory item not found');
    }

    // Ensure quantity is a number
    quantity = parseInt(quantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      throw new Error('Invalid quantity value');
    }

    if (item.quantity < quantity) {
      throw new Error('Insufficient quantity available');
    }

    const newQuantity = item.quantity - quantity;
    await item.update(
      { quantity: newQuantity },
      {
        sourceType: 'consumption',
        sourceId: null,
        notes: notes || `Manual consumption recorded: ${quantity} ${item.unit || 'units'}`,
        metadata: {
          consumedQuantity: quantity,
          remainingQuantity: newQuantity,
          consumedBy: userId
        },
        user: { id: userId },
        transaction
      }
    );

    await transaction.commit();
    return item;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.findByCategoryId = async (req) => {
  const {
    name,
    sortBy = 'created_at',
    sortOrder = 'desc',
    limit,
    page,
  } = req.query;

  const { category_id } = req.params;

  const filter = {};
  if (name) {
    filter.name = { [Op.iLike]: `%${name.toLowerCase()}%` };
  }
  
  if (category_id) {
    filter.category_id = category_id;
  }

  const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const sortExpression = [[sortBy, sortDirection]];

  const options = {
    include: [{ model: DepartmentCategory, as: 'category' }],
    sortBy: sortExpression,
  };

  if (limit && page) {
    options.limit = parseInt(limit, 10);
    options.page = parseInt(page, 10);
  }

  const { data, pagination } = await paginate(InventoryItem, filter, options);
  return { data: data, pagination };
};

exports.delete = async id => InventoryItem.destroy({ where: { id } });
