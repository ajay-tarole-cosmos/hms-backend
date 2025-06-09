const { Category, Sequelize } = require('../models');
const { Op } = require('sequelize');
const paginate = require("../models/plugins/paginate.plugin");

const createCategory = async (req) => {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    return category;
};

const getAllCategories = async (req) => {
    const {
        name,
        sortBy = 'created_at',
        sortOrder = 'desc',
        limit,
        page,
    } = req.query;

    const filter = {};
    const orConditions = [];

    if (name) {
        const lowerName = name.toLowerCase();
        orConditions.push(
            Sequelize.where(Sequelize.fn('lower', Sequelize.col('name')), {
                [Op.like]: `%${lowerName}%`,
            })
        );
    }

    if (orConditions.length > 0) {
        filter[Op.or] = orConditions;
    }

    const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    const sortExpression = [Sequelize.col(sortBy), sortDirection];

    const isPaginationEnabled = limit !== undefined && page !== undefined;

    const options = {
        sortBy: [sortExpression],
    };

    if (isPaginationEnabled) {
        options.limit = parseInt(limit, 10);
        options.page = parseInt(page, 10);
    }

    const { data, pagination } = await paginate(Category, filter, options);
    const categories = data.map((item) => item.get({ plain: true }));
console.log("categories",categories)
    return { categories, pagination };
};

const getCategoryById = async (id) => {
    return await Category.findByPk(id);
};

const updateCategory = async (req) => {
    const { name, description } = req.body;
    const category = await Category.findByPk(req.params.id);
    if (!category) return null;

    category.name = name || category.name;
    category.description = description || category.description;

    await category.save();
    return category;
};

const deleteCategory = async (id) => {
    const category = await Category.findByPk(id);
    if (!category) return null;
    await category.destroy();
    return category;
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};
