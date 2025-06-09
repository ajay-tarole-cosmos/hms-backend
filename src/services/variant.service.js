const { Variant, Subcategory, Category, Sequelize } = require('../models');
const { Op } = require('sequelize');
const paginate = require("../models/plugins/paginate.plugin");

const createVariant = async (payload) => {
  const {
    category_id,
    subcategory_id,
    name,
    price,
    flavor,
    size,
    quantity,
  } = payload;

  if (subcategory_id) {
    const subcategory = await Subcategory.findByPk(subcategory_id);
    if (!subcategory) throw new Error('Invalid subcategory_id');
  }

  if (category_id) {
    const category = await Category.findByPk(category_id);
    if (!category) throw new Error('Invalid category_id');
  }

  const variant = await Variant.create({
    category_id,
    subcategory_id,
    name,
    price,
    flavor,
    size,
    quantity,
    sold: quantity === 0,
  });

  return variant;
};

const getAllVariants = async (req) => {
  const {
    name,
    flavor,
    size,
    sortBy = 'created_at',
    sortOrder = 'desc',
    limit,
    page,
  } = req.query;

  const { subcategory_id } = req.params;

  const filter = {};
  const andConditions = [];

  if (name) {
    const lowerName = name.toLowerCase();
    andConditions.push(
      Sequelize.where(Sequelize.fn('lower', Sequelize.col('Variant.name')), {
        [Op.like]: `%${lowerName}%`,
      })
    );
  }

  if (subcategory_id) {
    filter.subcategory_id = subcategory_id;
  }

  if (flavor) {
    const lowerFlavor = flavor.toLowerCase();
    andConditions.push(
      Sequelize.where(Sequelize.fn('lower', Sequelize.col('Variant.flavor')), {
        [Op.like]: `%${lowerFlavor}%`,
      })
    );
  }

  if (size) {
    const lowerSize = size.toLowerCase();
    andConditions.push(
      Sequelize.where(Sequelize.fn('lower', Sequelize.col('Variant.size')), {
        [Op.like]: `%${lowerSize}%`,
      })
    );
  }

  if (andConditions.length > 0) {
    filter[Op.and] = andConditions;
  }

  const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const sortExpression = [Sequelize.col(`Variant.${sortBy}`), sortDirection];

  const isPaginationEnabled = limit !== undefined && page !== undefined;

  const include = [
    { model: Subcategory, as: 'subcategory' },
    { model: Category, as: 'category' },
  ];

  const options = {
    sortBy: [sortExpression],
    include,
  };

  if (isPaginationEnabled) {
    options.limit = parseInt(limit, 10);
    options.page = parseInt(page, 10);
  }

  const { data, pagination } = await paginate(Variant, filter, options);
  const variants = data.map((v) => v.get({ plain: true }));

  return { variants, pagination };
};

const getVariantById = async (id) => {
  const variant = await Variant.findByPk(id, {
    include: [
      { model: Subcategory, as: 'subcategory' },
      { model: Category, as: 'category' },
    ],
  });

  if (!variant) throw new Error('Variant not found');
  return variant;
};

const getVariantsBySubcategoryId = async (req) => {
  const {
    name,
    flavor,
    size,
    sortBy = 'created_at',
    sortOrder = 'desc',
    limit,
    page,
  } = req.query;

  const { subcategory_id } = req.params;

  const filter = {};
  const andConditions = [];

  if (name) {
    const lowerName = name.toLowerCase();
    andConditions.push(
      Sequelize.where(Sequelize.fn('lower', Sequelize.col('Variant.name')), {
        [Op.like]: `%${lowerName}%`,
      })
    );
  }

  if (subcategory_id) {
    filter.subcategory_id = subcategory_id;
  }

  if (flavor) {
    const lowerFlavor = flavor.toLowerCase();
    andConditions.push(
      Sequelize.where(Sequelize.fn('lower', Sequelize.col('Variant.flavor')), {
        [Op.like]: `%${lowerFlavor}%`,
      })
    );
  }

  if (size) {
    const lowerSize = size.toLowerCase();
    andConditions.push(
      Sequelize.where(Sequelize.fn('lower', Sequelize.col('Variant.size')), {
        [Op.like]: `%${lowerSize}%`,
      })
    );
  }

  if (andConditions.length > 0) {
    filter[Op.and] = andConditions;
  }

  const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const sortExpression = [Sequelize.col(`Variant.${sortBy}`), sortDirection];

  const isPaginationEnabled = limit !== undefined && page !== undefined;

  const include = [
    { model: Subcategory, as: 'subcategory' },
    { model: Category, as: 'category' },
  ];

  const options = {
    sortBy: [sortExpression],
    include,
  };

  if (isPaginationEnabled) {
    options.limit = parseInt(limit, 10);
    options.page = parseInt(page, 10);
  }

  const { data, pagination } = await paginate(Variant, filter, options);
  const variants = data.map((v) => v.get({ plain: true }));

  return { data:variants, pagination };
  // return await Variant.findAll({
  //   where: { subcategory_id },
  //   include: [
  //     { model: Subcategory, as: 'subcategory' },
  //     { model: Category, as: 'category' }
  //   ],
  //   order: [['created_at', 'DESC']],
  //   logging: console.log, // 👈 this helps debug
  // });
};

const updateVariant = async (id, payload) => {
  const {
    name,
    price,
    flavor,
    size,
    quantity,
    category_id,
    subcategory_id,
  } = payload;

  const variant = await Variant.findByPk(id);
  if (!variant) throw new Error('Variant not found');

  if (subcategory_id && subcategory_id !== variant.subcategory_id) {
    const subcategory = await Subcategory.findByPk(subcategory_id);
    if (!subcategory) throw new Error('Invalid subcategory_id');
    variant.subcategory_id = subcategory_id;
  }

  if (category_id && category_id !== variant.category_id) {
    const category = await Category.findByPk(category_id);
    if (!category) throw new Error('Invalid category_id');
    variant.category_id = category_id;
  }

  if (name !== undefined) variant.name = name;
  if (price !== undefined) variant.price = price;
  if (flavor !== undefined) variant.flavor = flavor;
  if (size !== undefined) variant.size = size;
  if (quantity !== undefined) {
    variant.quantity = quantity;
    variant.sold = quantity === 0;
  }

  await variant.save();
  return variant;
};

const deleteVariant = async (id) => {
  const variant = await Variant.findByPk(id);
  if (!variant) throw new Error('Variant not found');

  await variant.destroy();
  return { message: 'Variant deleted successfully' };
};

module.exports = {
  createVariant,
  getAllVariants,
  getVariantById,
  getVariantsBySubcategoryId,
  updateVariant,
  deleteVariant,
};
