// services/category.service.js
const { DepartmentCategory, Department } = require('../models');
const paginate = require("../models/plugins/paginate.plugin");

exports.create = async payload => DepartmentCategory.create(payload);

exports.findAll = async query => {
  const { page, limit, sortBy = [['created_at', 'DESC']] } = query;
  return paginate(
    DepartmentCategory,
    {},
    {
      page,
      limit,
      sortBy,
      include: [{ model: Department, as: 'department' }],
    }
  );
};

exports.findById = async id =>
  DepartmentCategory.findByPk(id, { include: ['department', 'items'] });

exports.update = async (id, payload) => {
  await DepartmentCategory.update(payload, { where: { id } });
  return DepartmentCategory.findByPk(id);
};
exports.findByDepartmentId=async (req)=>{
  const {
      name,
      sortBy = 'created_at',
      sortOrder = 'desc',
      limit,
      page,
    } = req.query;
  
    const {department_id}=req.params;
  
    const filter = {};
    if (name) {
      filter.name = { [Op.iLike]: `%${name.toLowerCase()}%` };
    }
    
    if(department_id){
      filter.department_id=department_id;
    }
  
    const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    const sortExpression = [[sortBy, sortDirection]];
  
    const options = {
      include: [{ model: Department, as: 'department' }],
      sortBy: sortExpression,
    };
  
    if (limit && page) {
      options.limit = parseInt(limit, 10);
      options.page = parseInt(page, 10);
    }
  
    const { data, pagination } = await paginate(DepartmentCategory, filter, options);
    return { data: data, pagination };
}

exports.delete = async id => DepartmentCategory.destroy({ where: { id } });
