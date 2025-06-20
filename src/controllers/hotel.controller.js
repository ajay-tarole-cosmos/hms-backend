const httpStatus = require("http-status");
const { hotelService } = require("../services");
const catchAsync = require("../utils/catchAsync");
const sendResponse = require("../utils/sendResponse");

const getHotels=catchAsync(async(req,res)=>{
    const hotels = await hotelService.getAllHotels(req);
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Hotels fetched successfully",
      success: true,
      data: hotels
    });
})
const createHotel=catchAsync(async(req,res)=>{
    const hotel = await hotelService.createHotel(req.body);
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Hotels created successfully",
      success: true,
      data: hotel
    });
})

const getHotelById=catchAsync(async(req,res)=>{
    const hotel = await hotelService.getHotelById(req.params.id);
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Hotel fetched successfully",
      success: true,
      data: hotel
    });
})
const updateHotel=catchAsync(async(req,res)=>{
    const updated = await hotelService.updateHotel(req.params.id, req.body);
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Hotel updated successfully",
      success: true,
      data: updated
    });
})

const deleteHotel=catchAsync(async(req,res)=>{
  await hotelService.deleteHotel(req.params.id);
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Hotel deleted successfully",
      success: true,
    });
})

// Facility
const getFacilities = catchAsync(async (req, res) => {
  const data = await hotelService.getFacilities();
  sendResponse(res, { statusCode: httpStatus.OK, message: "Facilities retrieved", success: true, data });
});

const getFacilityById = catchAsync(async (req, res) => {
  const data = await hotelService.getFacilityById(req.params.id);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Facility retrieved", success: true, data });
});

const createFacility = catchAsync(async (req, res) => {
  const data = await hotelService.createFacility(req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, message: "Facility created", success: true, data });
});

const updateFacility = catchAsync(async (req, res) => {
  const data = await hotelService.updateFacility(req.params.id, req.body);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Facility updated", success: true, data });
});

const deleteFacility = catchAsync(async (req, res) => {
  await hotelService.deleteFacility(req.params.id);
  sendResponse(res, { statusCode: httpStatus.NO_CONTENT, message: "Facility deleted", success: true });
});

// Amenity
const getAmenities = catchAsync(async (req, res) => {
  const data = await hotelService.getAmenities();
  sendResponse(res, { statusCode: httpStatus.OK, message: "Amenities retrieved", success: true, data });
});

const getAmenityById = catchAsync(async (req, res) => {
  const data = await hotelService.getAmenityById(req.params.id);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Amenity retrieved", success: true, data });
});

const createAmenity = catchAsync(async (req, res) => {
  console.log("req.body", req.body);
  
  const data = await hotelService.createAmenity({
    name: req.body.amenity_name,  
  });

  console.log("data", data);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Amenity created",
    success: true,
    data,
  });
});

const updateAmenity = catchAsync(async (req, res) => {
  console.log("req.body  for maneihjn",req.body)
  const data = await hotelService.updateAmenity(req.params.id, req.body);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Amenity updated", success: true, data });
});

const deleteAmenity = catchAsync(async (req, res) => {
  await hotelService.deleteAmenity(req.params.id);
  sendResponse(res, { statusCode: httpStatus.NO_CONTENT, message: "Amenity deleted", success: true });
});

module.exports={
    getHotels,
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