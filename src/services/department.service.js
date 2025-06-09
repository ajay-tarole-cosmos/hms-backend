// services/department.service.js
const { Op } = require('sequelize');
const { Department, Sequelize } = require('../models');
const paginate = require("../models/plugins/paginate.plugin");

exports.create = async payload => Department.create(payload);

exports.findAll = async (req) => {
  // const { page, limit, sortBy = [['created_at', 'DESC']] } = query;
  // return paginate(Department, {}, { page, limit, sortBy });
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

  const { data, pagination } = await paginate(Department, filter, options);
  const departments = data.map((item) => item.get({ plain: true }));

  return { departments, pagination };
};

exports.findById = async id => Department.findByPk(id, { include: ['categories'] });

exports.update = async (id, payload) => {
  await Department.update(payload, { where: { id } });
  return Department.findByPk(id);
};

exports.delete = async id => Department.destroy({ where: { id } });
