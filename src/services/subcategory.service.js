const { Subcategory, Category ,Sequelize} = require('../models');
const { Op } = require('sequelize');
const paginate = require("../models/plugins/paginate.plugin");

const createSubcategory = async (payload) => {
  const { category_id, name, description } = payload;

  const category = await Category.findByPk(category_id);
  if (!category) throw new Error('Invalid category_id');

  const subcategory = await Subcategory.create({ category_id, name, description });
  return subcategory;
};

const getAllSubcategories = async (req) => {
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
    include: [{ model: Category, as: 'category' }],
    sortBy: sortExpression,
  };

  if (limit && page) {
    options.limit = parseInt(limit, 10);
    options.page = parseInt(page, 10);
  }

  const { data, pagination } = await paginate(Subcategory, filter, options);
  return { subcategories: data, pagination };
};

const getSubcategoryById = async (id) => {
  const subcategory = await Subcategory.findByPk(id, {
    include: { model: Category, as: 'category' },
  });
  return subcategory;
};

const getSubcategoriesByCategoryId = async (req) => {
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
    include: [{ model: Category, as: 'category' }],
    sortBy: sortExpression,
  };

  if (limit && page) {
    options.limit = parseInt(limit, 10);
    options.page = parseInt(page, 10);
  }

  const { data, pagination } = await paginate(Subcategory, filter, options);
  return { data: data, pagination };

  // return await Subcategory.findAll({
  //   where: { category_id: categoryId },
  //   order: [['created_at', 'DESC']],
  // });
};

const updateSubcategory = async (id, payload) => {
  const { name, description, category_id } = payload;

  const subcategory = await Subcategory.findByPk(id);
  if (!subcategory) throw new Error('Subcategory not found');

  if (category_id) {
    const category = await Category.findByPk(category_id);
    if (!category) throw new Error('Invalid category_id');
    subcategory.category_id = category_id;
  }

  subcategory.name = name || subcategory.name;
  subcategory.description = description || subcategory.description;

  await subcategory.save();
  return subcategory;
};

const deleteSubcategory = async (id) => {
  const subcategory = await Subcategory.findByPk(id);
  if (!subcategory) throw new Error('Subcategory not found');

  await subcategory.destroy();
  return true;
};

module.exports = {
  createSubcategory,
  getAllSubcategories,
  getSubcategoryById,
  getSubcategoriesByCategoryId,
  updateSubcategory,
  deleteSubcategory,
};
