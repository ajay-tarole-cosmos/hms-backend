/**
 * @typedef {Object} QueryResult
 * @property {Object[]} results - Results found
 * @property {number} page - Current page
 * @property {number} limit - Maximum number of results per page
 * @property {number} totalPages - Total number of pages
 * @property {number} totalResults - Total number of documents
 */

/**
 * Paginate function for Sequelize models
 * @param {Model} model - Sequelize model
 * @param {Object} filter - Filter conditions (Sequelize `where` object)
 * @param {Object} options - Pagination and sorting options
 * @param {string} [options.sortBy] - Sorting criteria using `field:asc` or `field:desc`
 * @param {string} [options.include] - Associations to include (Sequelize `include`)
 * @param {number} [options.limit] - Max results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const { Sequelize, Op, fn, col, where, literal } = require('sequelize');

const paginate = async (model, filter, options) => {
  const DataTypes = model.sequelize.constructor.DataTypes;

  const stringFields = Object.entries(model.rawAttributes)
    .filter(([_, attr]) =>
      [DataTypes.STRING.key, DataTypes.TEXT.key].includes(attr.type?.key)
    )
    .map(([key]) => key);

  let sort = [];
  if (options.sortBy && Array.isArray(options.sortBy)) {

    sort = options.sortBy.map(([colExpr, direction]) => {
      const fieldName = colExpr?.col || null;
      if (fieldName && stringFields.includes(fieldName)) {
        return [model.sequelize.fn('lower', model.sequelize.col(fieldName)), direction.toUpperCase()];
      }

      return [colExpr, direction.toUpperCase()];
    });
  } else {
    sort = [['created_at', 'DESC']];
  }
  const isPaginationEnabled = options?.limit !== undefined && options?.page !== undefined;

  let limit, page, offset;
  if (isPaginationEnabled) {
    limit = parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
    page = parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
    offset = (page - 1) * limit;
  }
  
  const queryOptions = {
    where: filter,
    order: sort,
    distinct: true,
  };
  
  if (isPaginationEnabled) {
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }
  
  if (options.include) {
    queryOptions.include = options.include;
  }
  
  const { count: totalResults, rows: data } = await model.findAndCountAll(queryOptions);
  
  const totalPages = isPaginationEnabled ? Math.ceil(totalResults / limit) : 1;
  
  const pagination = {
    page: isPaginationEnabled ? page : 1,
    limit: isPaginationEnabled ? limit : totalResults,
    totalPages,
    totalResults,
  };
  return { data, pagination };
};

module.exports = paginate;