const { Service } = require("../models");

const createService = async (data) => {
  return await Service.create(data);
};

const getAllServices = async () => {
      const  filters={}
        const { page, limit, sortBy = [["created_at", "desc"]] } = req.query;
    const service= paginate(Service, filters, { page, limit, sortBy })
    return service;
};

const getServiceById = async (id) => {
  const service = await Service.findByPk(id);
  if (!service) {
    throw new Error("Service not found");
  }
  return service;
};

const updateService = async (id, data) => {
  const service = await getServiceById(id);
  await service.update(data);
  return service;
};

const deleteService = async (id) => {
  const service = await getServiceById(id);
  await service.destroy();
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
};
