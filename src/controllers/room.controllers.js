const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const sendResponse = require('../utils/sendResponse');
const { roomService } = require('../services');

const createRoom = catchAsync(async (req, res) => {
  const createdRoom = await roomService.createRooms(req);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Room created successfully",
    success: true,
    data: { createdRoom }
  })
});

const createRoomNumberWithType = catchAsync(async (req, res) => {
  const createRoomStatus = await roomService.createRoomNumber(req)
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Room created successfully",
    success: true,
    data: { createRoomStatus }
  });
});

const getAllRoomType = catchAsync(async (req, res) => {
  const { rooms, pagination } = await roomService.getAllRoomType(req)
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Rooms Types retrieved successfully',
    success: true,
    data: { rooms, pagination }
  });
})

const getAllRoomTypewithOffers = catchAsync(async (req, res) => {
  const { rooms, pagination } = await roomService.getAllRoomTypewithOffers(req)
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Rooms Types retrieved successfully',
    success: true,
    data: { rooms, pagination }
  });
})

const getAllRoomList = catchAsync(async (req, res) => {
  const { rooms, pagination } = await roomService.getRoomList(req)
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Rooms retrieved successfully',
    success: true,
    data: { rooms, pagination }
  });
})

const updateRoom = catchAsync(async (req, res) => {
  const updatedRoom = await roomService.updateRoom(req);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Room updated successfully",
    success: true,
    data: { updatedRoom }
  });
});

const updateRoomNumberById = catchAsync(async (req, res) => {
  const updatedRoom = await roomService.updateRoomNumber(req);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Room Number updated successfully",
    success: true,
    data: {}
  });
});


const updateRoomStatus = catchAsync(async (req, res) => {
  const data = await roomService.updateRoomStatusService(req)
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Room status updated successfully",
    success: true,
    data
  });
})

const getRoomStatus = catchAsync(async (req, res) => {
  const rooms = await roomService.getRoomStatus(req)
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Get all room status successfully",
    success: true,
    data: rooms
  });
})

const deleteRoomTypeById = catchAsync(async (req, res) => {
  const { id } = req.params;
  await roomService.deleteRoomData(id);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Room details deleted successfully",
    success: true,
    data: {},
  });
});

const deleteRoomNumber = catchAsync(async (req, res) => {
  const { id } = req.params;
  await roomService.deleteRoomNumberById(id);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Room type deleted successfully",
    success: true,
    data: {},
  });
});


const createOffer = catchAsync(async (req, res) => {
  const result = await roomService.createOffer(req.body);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Offer created successfully",
    success: true,
    data: result,
  });
});

const getOffers = catchAsync(async (req, res) => {
  const result = await roomService.getAllOffers(req);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    data: result,
  });
});

const getOfferById = catchAsync(async (req, res) => {
  const result = await roomService.getOfferById(req.params.id);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    data: result,
  });
});

const updateOffer = catchAsync(async (req, res) => {
  const result = await roomService.updateOffer(req.params.id, req.body);
  return sendResponse(res, {
    statusCode: 200,
    message: "Offer updated",
    success: true,
    data: result,
  });
});

const deleteOffer = catchAsync(async (req, res) => {
  await roomService.deleteOffer(req.params.id);
  return sendResponse(res, {
    statusCode: 200,
    message: "Offer deleted",
    success: true,
  });
});

const createPackage = catchAsync(async (req, res) => {
  const result = await roomService.createPackage(req.body);
  return sendResponse(res, {
    statusCode: 200,
    message: "Package created",
    success: true,
    data: result,
  });
});

const getPackages = catchAsync(async (req, res) => {
  const result = await roomService.getAllPackages(req);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    data: result,
  });
});

const getPackageById = catchAsync(async (req, res) => {
  const result = await roomService.getPackageById(req.params.id);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    data: result,
  });
});

const updatePackage = catchAsync(async (req, res) => {
  const result = await roomService.updatePackage(req.params.id, req.body);
  return sendResponse(res, {
    statusCode: 200,
    message: "Package updated",
    success: true,
    data: result,
  });
});

const deletePackage = catchAsync(async (req, res) => {
  await roomService.deletePackage(req.params.id);
  return sendResponse(res, {
    statusCode: 200,
    message: "Package deleted",
    success: true,
  });
});

const getRoomDetails = catchAsync(async (req, res) => {
  const id = req.params.id;
  const room = await roomService.getRoomDetailById(id);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: room,
  });
});

const getAllRoomBasedTypes = catchAsync(async (req, res)=>{
  const roomType = await roomService.getAllRoomTypes()
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: roomType,
  });
})

const getAllRoomStatus = catchAsync(async (req, res)=>{
  const roomStatus = await roomService.getAllRoomStatus()
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: roomStatus,
  });
})

const allRooms=catchAsync(async (req, res)=>{
  const rooms = await roomService.allRooms(req)
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: rooms,
  });
})
const getRoomAvailability=catchAsync(async (req, res)=>{
  const rooms = await roomService.getRoomAvailability(req,res)
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: rooms,
  });
})

const getAllRoomNumber = catchAsync(async (req,res)=>{
  const room_number = await roomService.getAllRoomNumberWithId()
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: room_number,
  });
})

module.exports = {
  updateOffer,
  createRoom, createRoomNumberWithType, getAllRoomList, getAllRoomType, updateRoomStatus, getRoomStatus,
  deleteRoomTypeById, createOffer, updateRoom, updateRoomNumberById, deleteRoomNumber, getRoomDetails, getPackages, deleteOffer, getOfferById, updatePackage,
  getOffers, createPackage, getPackageById, deletePackage, getAllRoomTypewithOffers,getAllRoomBasedTypes,getAllRoomStatus,
  allRooms,getRoomAvailability,getAllRoomNumber
}

