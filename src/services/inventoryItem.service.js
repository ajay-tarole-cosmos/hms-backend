// services/inventoryItem.service.js
const { Op } = require('sequelize');
const { InventoryItem, Category, Department, DepartmentCategory } = require('../models');
const paginate = require("../models/plugins/paginate.plugin");

exports.create = async payload => 
  {
    console.log(payload)
    let check=await DepartmentCategory.findByPk(payload.category_id);
    console.log(check)

   const data=await InventoryItem.create(payload);
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

exports.update = async (id, payload) => {
  await InventoryItem.update(payload, { where: { id } });
  return InventoryItem.findByPk(id);
};


exports.findByCategoryId=async (req)=>{
  const {
      name,
      sortBy = 'created_at',
      sortOrder = 'desc',
      limit,
      page,
    } = req.query;
  
    const {category_id}=req.params;
  
    const filter = {};
    if (name) {
      filter.name = { [Op.iLike]: `%${name.toLowerCase()}%` };
    }
    
    if(category_id){
      filter.category_id=category_id;
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
}

exports.delete = async id => InventoryItem.destroy({ where: { id } });
