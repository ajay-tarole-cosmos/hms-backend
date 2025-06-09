const { Op } = require('sequelize');
const paginate = require("../models/plugins/paginate.plugin");
const { Hotels, Amenity, Facility } = require('../models');

const getAllHotels=async(req)=>{
  const  filters={}
    const { page, limit, sortBy = [["created_at", "desc"]] } = req.query;
const hotels= paginate(Hotels, filters, { page, limit, sortBy })
return hotels;
}

 const createHotel = async (hotelData) => {
  return Hotels.create(hotelData);
};


const getHotelById = async (id) => {
  const hotel = await Hotels.findByPk(id);
  if (!hotel) throw new Error("Hotel not found");
  return hotel;
};

const updateHotel = async (id, data) => {
  const hotel = await Hotels.findByPk(id);
  if (!hotel) throw new Error("Hotel not found");
  await hotel.update(data);
  return hotel;
};

const deleteHotel = async (id) => {
  const hotel = await Hotels.findByPk(id);
  if (!hotel) throw new Error("Hotel not found");

  await hotel.destroy();
};

// --- Facility ---
const getFacilities = async () => {
  return await Facility.findAll({ attributes: ['id', 'facility_name'] });
};

const getFacilityById = async (id) => {
  return await Facility.findByPk(id, { attributes: ['id', 'facility_name'] });
};

const createFacility = async (data) => {
  return await Facility.create({ facility_name: data.facility_name });
};

const updateFacility = async (id, data) => {
  const facility = await Facility.findByPk(id);
  if (!facility) throw new Error('Facility not found');
  await facility.update({ facility_name: data.facility_name });
  return facility;
};

const deleteFacility = async (id) => {
  const facility = await Facility.findByPk(id);
  if (!facility) throw new Error('Facility not found');
  await facility.destroy();
};

// --- Amenity ---
const getAmenities = async () => {
  return await Amenity.findAll({ attributes: ['id', 'amenity_name'] });
};

const getAmenityById = async (id) => {
  return await Amenity.findByPk(id, { attributes: ['id', 'amenity_name'] });
};

const createAmenity = async (data) => {
  return await Amenity.create({ amenity_name: data.amenity_name });
};

const updateAmenity = async (id, data) => {
  const amenity = await Amenity.findByPk(id);
  if (!amenity) throw new Error('Amenity not found');
  await amenity.update({ amenity_name: data.amenity_name });
  return amenity;
};

const deleteAmenity = async (id) => {
  const amenity = await Amenity.findByPk(id);
  if (!amenity) throw new Error('Amenity not found');
  await amenity.destroy();
};

module.exports={
    getAllHotels,
    deleteHotel,
    updateHotel,
    getHotelById,
    createHotel,
    getFacilities,
    createFacility,
    getFacilityById,
    updateFacility,
    deleteFacility,
    getAmenities,
    getAmenityById,
    createAmenity,
    updateAmenity,
    deleteAmenity,
}