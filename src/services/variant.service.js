const { Variant, Subcategory, Category, Sequelize } = require('../models');
const { Op } = require('sequelize');
const paginate = require("../models/plugins/paginate.plugin");

const createVariant = async (payload) => {
  const { subcategory_id, name, price, flavor, size } = payload;

  // Validate subcategory
  const subcategory = await Subcategory.findByPk(subcategory_id);
  if (!subcategory) throw new Error("Invalid subcategory_id");

  // Create variant
  const variant = await Variant.create({
    subcategory_id,
    name,
    price,
    flavor,
    size,
  });

  return variant;
};

const getAllVariants = async (query) => {
  const {
    name,
    flavor,
    size,
    subcategory_id,
    sortBy = 'created_at',
    sortOrder = 'desc',
    limit,
    page,
  } = query;

  const filter = {};
  const andConditions = [];

  if (name) {
    andConditions.push(
      Sequelize.where(Sequelize.fn('lower', Sequelize.col('Variant.name')), {
        [Op.like]: `%${name.toLowerCase()}%`,
      })
    );
  }

  if (subcategory_id) {
    filter.subcategory_id = subcategory_id;
  }

  if (flavor) {
    andConditions.push(
      Sequelize.where(Sequelize.fn('lower', Sequelize.col('Variant.flavor')), {
        [Op.like]: `%${flavor.toLowerCase()}%`,
      })
    );
  }

  if (size) {
    andConditions.push(
      Sequelize.where(Sequelize.fn('lower', Sequelize.col('Variant.size')), {
        [Op.like]: `%${size.toLowerCase()}%`,
      })
    );
  }

  if (andConditions.length > 0) {
    filter[Op.and] = andConditions;
  }

  const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const sortField = sortBy || 'created_at';

  const include = [
    {
      model: Subcategory,
      as: 'subcategory',
    }
  ];

  const options = {
    sortBy: [[Sequelize.col(`Variant.${sortField}`), sortDirection]],
    include,
  };

  if (limit && page) {
    options.limit = parseInt(limit, 10);
    options.page = parseInt(page, 10);
  }

  const { data, pagination } = await paginate(Variant, filter, options);
  const variants = data.map(v => v.get({ plain: true }));

  return { variants, pagination };
};

const getVariantById = async (id) => {
  const variant = await Variant.findByPk(id, {
    include: [
      { model: Subcategory, as: 'subcategory' },
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

  const filter = {
    subcategory_id,
  };

  const andConditions = [];

  if (name) {
    andConditions.push(
      Sequelize.where(Sequelize.fn('lower', Sequelize.col('Variant.name')), {
        [Op.like]: `%${name.toLowerCase()}%`,
      })
    );
  }

  if (flavor) {
    andConditions.push(
      Sequelize.where(Sequelize.fn('lower', Sequelize.col('Variant.flavor')), {
        [Op.like]: `%${flavor.toLowerCase()}%`,
      })
    );
  }

  if (size) {
    andConditions.push(
      Sequelize.where(Sequelize.fn('lower', Sequelize.col('Variant.size')), {
        [Op.like]: `%${size.toLowerCase()}%`,
      })
    );
  }

  if (andConditions.length > 0) {
    filter[Op.and] = andConditions;
  }

  const sortField = sortBy || 'created_at';
  const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const options = {
    sortBy: [[Sequelize.col(`Variant.${sortField}`), sortDirection]],
    include: [
      {
        model: Subcategory,
        as: 'subcategory',
      }
    ],
  };

  if (limit && page) {
    options.limit = parseInt(limit, 10);
    options.page = parseInt(page, 10);
  }

  const { data, pagination } = await paginate(Variant, filter, options);
  const variants = data.map(v => v.get({ plain: true }));

  return { data: variants, pagination };
};

const updateVariant = async (id, payload) => {
  const { name, price, flavor, size, subcategory_id } = payload;

  const variant = await Variant.findByPk(id);
  if (!variant) throw new Error('Variant not found');

  if (subcategory_id && subcategory_id !== variant.subcategory_id) {
    const subcategory = await Subcategory.findByPk(subcategory_id);
    if (!subcategory) throw new Error('Invalid subcategory_id');
    variant.subcategory_id = subcategory_id;
  }

  if (name !== undefined) variant.name = name;
  if (price !== undefined) variant.price = price;
  if (flavor !== undefined) variant.flavor = flavor;
  if (size !== undefined) variant.size = size;

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
