const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const paginate = require("../models/plugins/paginate.plugin");
const { Op, literal } = require('sequelize');
const RoomStatus = require("../utils/RoomStatus");
const { RoomPackage, Package, RoomPricing, Reservation, Room, RoomNumber, Amenity } = require('../models');
const { isUuid, toInt, toFloat } = require("../utils/TypeCheck");
const dayjs = require("dayjs");

const createRooms = async (req) => {
  const {
    room_type,
    amenities,
    capacity,
    bed_count,
    bed_type,
    extra_bed,
    room_size,
    price,
    number_of_room
  } = req.body;
  if (!room_type?.trim()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Room type is required');
  }
  if (toInt(capacity) === null) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Capacity must be a number');
  }
  if (toInt(number_of_room) === null) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Number of room must be a number');
  }
  if (toFloat(price) === null) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'price must be a number');
  }
  const parsedBedCount = bed_count ? toInt(bed_count) : 1;
  const parsedBedType = bed_type?.trim() || null;
  const parsedExtraBed = extra_bed ? toInt(extra_bed) : 0;
  const parsedRoomSize = room_size ? toInt(room_size) : null;

  const imageUrl = req.files?.image?.[0]?.path ?? null;

  const parseArrayField = (val) =>
    !val
      ? []
      : Array.isArray(val)
        ? val
        : val
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v);

  const amenitiesArr = parseArrayField(amenities).filter(isUuid);

  if (amenitiesArr.length > 0) {
    const found = await Amenity.findAll({ where: { id: amenitiesArr } });
    if (found.length !== amenitiesArr.length) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'One or more amenity IDs are invalid'
      );
    }
  }

  const dup = await Room.findOne({ where: { room_type } });
  if (dup) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'This Room Type already exists'
    );
  }
  const newRoom = await Room.create({
    number_of_room: number_of_room || 1,
    room_type,
    amenities: amenitiesArr,
    capacity: toInt(capacity),
    bed_count: parsedBedCount,
    bed_type: parsedBedType,
    extra_bed: parsedExtraBed,
    room_size: parsedRoomSize,
    price: toFloat(price),
    image_url: imageUrl,
  });

  return newRoom;
};

const createRoomNumber = async (req) => {
  const { room_number, room_type, room_status, floor_number, standard_checkout } = req.body;

  const existRoom = await RoomNumber.findOne({ where: { room_number } });
  if (existRoom) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Room number already exists");
  }
  const roomTypeDetails = await Room.findByPk(room_type);
  if (!roomTypeDetails) {
    throw new ApiError(httpStatus.BAD_REQUEST, `${room_type} room type does not exist`);
  }
  const existingRoomsCount = await RoomNumber.count({
    where: { room_id: room_type }
  });

  if (existingRoomsCount >= roomTypeDetails.number_of_room) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Maximum ${roomTypeDetails.number_of_room} ${room_type} rooms already created`
    );
  }
  const newRoom = await RoomNumber.create({
    room_id: roomTypeDetails.id,
    room_number,
    room_type: roomTypeDetails.room_type,
    room_status,
    floor_number,
    stanndard_checkout: standard_checkout
  });

  return newRoom;
};

const getAllRoomType = async (req) => {
  const {
    sortBy = 'created_at',
    sortOrder = 'desc',
    limit,
    page,
    room_type,
    amenities,
    capacity,
    start_price = 0,
    end_price = 0
  } = req.query;

  const filter = {};
  if (room_type) {
    filter.room_type = {
      [Op.iLike]: `${room_type}%`
    };
  }

  if (start_price || end_price) {
    filter.price = {
      [Op.between]: [
        parseFloat(start_price) || 0,
        parseFloat(end_price) || Number.MAX_SAFE_INTEGER
      ]
    };
  }

  if (capacity) {
    if (typeof capacity !== 'number' && isNaN(Number(capacity))) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Please enter a valid input");
    }
    filter.capacity = {
      [Op.eq]: parseInt(capacity)
    };
  }

  if (amenities) {
    const matchingAmenities = await Amenity.findAll({
      where: {
        amenity_name: {
          [Op.iLike]: `${amenities}%`,
        }
      },
      attributes: ['id']
    });
    const amenityIds = matchingAmenities.map(a => a.id);

    if (amenityIds.length > 0) {
      filter.amenities = {
        [Op.contains]: amenityIds
      };
    }
  }
  const isPaginationEnabled = limit !== undefined && page !== undefined;

  const options = {
    sortBy: [[sortBy, sortOrder.toUpperCase()]],
  };
  if (isPaginationEnabled) {
    options.limit = parseInt(limit, 10);
    options.page = parseInt(page, 10);
  }
  const { data, pagination } = await paginate(Room, filter, options);
  const roomIds = data.map(room => room.id);
  const allOffers = await RoomPricing.findAll({
    attributes: ['room_type_id'],
    raw: true,
  });


  const offerCountMap = allOffers.reduce((acc, curr) => {
    acc[curr.room_type_id] = (acc[curr.room_type_id] || 0) + 1;
    return acc;
  }, {});

  const rooms = await Promise.all(
    data.map(async (room) => {
      const plainRoom = room.get({ plain: true });

      //  Fetch amenity details
      if (plainRoom.amenities?.length) {
        const amenityRecords = await Amenity.findAll({
          where: { id: plainRoom.amenities },
          attributes: ['id', 'amenity_name'],
        });
        plainRoom.amenity_details = amenityRecords.map(a => a.get({ plain: true }));
      } else {
        plainRoom.amenity_details = [];
      }

      return {
        ...plainRoom,
        offer_count: offerCountMap[plainRoom.id] || 0,
      };
    })
  );

  return { rooms, pagination };
};

const getAllRoomTypewithOffers = async (req) => {
  const {
    sortBy = 'created_at',
    sortOrder = 'desc',
    limit = 10,
    page = 1,
    room_type,
    amenities,
  } = req.query;

  const filter = {};
  if (room_type) {
    filter.room_type = {
      [Op.iLike]: `${room_type}%`
    };
  }

  let amenityIds = null;

  if (amenities) {
    const amenityNames = amenities.split(',').map(name => name.trim());
    const matchingAmenities = await Amenity.findAll({
      where: {
        amenity_name: {
          [Op.iLike]: `${amenities}%`,
        }
      },
      attributes: ['id']
    });
    amenityIds = matchingAmenities.map(a => a.id);

    if (amenityIds.length > 0) {
      filter.amenities = {
        [Op.contains]: amenityIds
      };
    }
  }

  const options = {
    limit: parseInt(limit),
    page: parseInt(page),
    sortBy: [[sortBy, sortOrder.toUpperCase()]],
    include: [{
      model: RoomPackage,
      as: 'roomPackageLinks',
      attributes: ['id', 'room_id', 'package_id'],
      include: [{
        model: Package,
        as: 'package',
        attributes: ['id', 'name', 'description', 'price']
      }]
    }]
  };

  const { data, pagination } = await paginate(Room, filter, options);

  const today = new Date();
  const dayOfWeek = today.getDay();

  const roomIds = data?.map(room => room.id);

  const allOffers = await RoomPricing.findAll({
    where: {
      room_type_id: { [Op.in]: roomIds },
      valid_date_from: { [Op.lte]: today },
      valid_date_to: { [Op.gte]: today }
    },
    raw: true
  });

  const offersByRoomId = allOffers?.reduce((acc, offer) => {
    if (!acc[offer.room_type_id]) {
      acc[offer.room_type_id] = [];
    }
    acc[offer.room_type_id].push(offer);
    return acc;
  }, {});
  const rooms = await Promise.all(
    data.map(async (room) => {
      const plainRoom = room.get({ plain: true });

      const amenityRecords = plainRoom.amenities?.length
        ? await Amenity.findAll({
          where: { id: plainRoom.amenities },
          attributes: ['id', 'amenity_name'],
        })
        : [];

      const roomOffers = offersByRoomId[plainRoom.id] || [];

      let appliedOffer = null;
      const weekendOffer = roomOffers.find(o => o.offer_type === 'weekend');
      const seasonalOffer = roomOffers.find(o => o.offer_type === 'seasonal');
      const isWeekend = [0, 6].includes(dayOfWeek);

      if (isWeekend && weekendOffer) {
        appliedOffer = weekendOffer;
      } else if (seasonalOffer) {
        appliedOffer = seasonalOffer;
      }

      const basePrice = parseFloat(plainRoom.price || 1000);
      let finalPrice = basePrice;
      let discountPercentage = 0;

      if (appliedOffer) {
        discountPercentage = parseFloat(appliedOffer.discount_value || 0);
        finalPrice = basePrice - (basePrice * discountPercentage / 100);
      }

      // Get packages
      const packages = plainRoom.roomPackages?.map(rp => rp.package) || [];
      const packagePriceTotal = packages.reduce((sum, pkg) => sum + parseFloat(pkg.price || 0), 0);
      const totalPriceWithPackages = finalPrice + packagePriceTotal;

      return {
        ...plainRoom,
        amenity_details: amenityRecords.map(a => a.get({ plain: true })),
        base_price: basePrice,
        discounted_price: totalPriceWithPackages,
        room_only_price: finalPrice,
        package_total_price: packagePriceTotal,
        discount_percentage: appliedOffer ? discountPercentage : 0,
        applied_offer: appliedOffer || null,
        is_discounted: !!appliedOffer,
      };
    })
  );
  return { rooms, pagination };
};

const getRoomList = async (req) => {
  const {
    sortBy = "created_at",
    sortOrder = "desc",
    limit = 10,
    page = 1,
    room_type,
    room_status,
    start_date,
    end_date,
  } = req.query;

  const filter = {};

  if (room_type) {
    filter.room_type = { [Op.iLike]: ` ${room_type}%` };
  }

  if (room_status) {
    filter.room_status = { [Op.iLike]: `${room_status}%` };
  }

  if (start_date || end_date) {
    // let whereCondition = {};
    // if (end_date) whereCondition.check_in_date_time = { [Op.lt]: start_date }
    // if (start_date) whereCondition.check_out_date_time = { [Op.gt]: start_date }

    // const overlappingReservations = await Reservation.findAll({
    //   where: whereCondition,
    //   attributes: ["rooms"],
    // });
    // // reservedRoomNumberIds = overlappingReservations.map(r => r.room_number_id);
    // let reservedRoomNumberIds = [];
    // overlappingReservations.forEach(r => {
    //   r?.rooms?.forEach((item)=>{
    //    reservedRoomNumberIds.push(item.room_id)
    //   })
    // });

    // if (reservedRoomNumberIds.length > 0) {
    //   filter.id = {
    //     [Op.notIn]: reservedRoomNumberIds,
    //   };
    // }
    let resultData = await getRoomStatusForDate(start_date);

    const totalResults = resultData?.length || 0;
    const currentPage = page ? page : 1;
    const perPage = limit ? limit : totalResults;
    const totalPages = Math.ceil(totalResults / perPage);
    
    // Calculate start and end index
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    
    // Slice the data for current page
    const paginatedData = resultData.slice(startIndex, endIndex);
    
    const pagination = {
      page: currentPage,
      limit: perPage,
      totalPages,
      totalResults,
    };
    
    return {
      rooms: paginatedData,
      pagination,
    };
  }else{

  const options = {
    limit: parseInt(limit),
    page: parseInt(page),
    sortBy: [[sortBy, sortOrder.toUpperCase()]],
  };
  const { data, pagination } = await paginate(RoomNumber, filter, options);

  let rooms = data.map(room => room.get({ plain: true }));
  if (start_date || end_date) {
    rooms = rooms.map((item) => ({ ...item, room_status: 'available', }))
  }  
  return {
    rooms,
    pagination,
  };
}
};

async function getRoomStatusForDate(targetDate) {
  const startOfDay=new Date(targetDate);
  // console.log({targetDate})
  startOfDay.setUTCHours(0,0,0,0);
  // console.log({startOfDay})
  const endOfDay=new Date(targetDate);
  endOfDay.setUTCHours(23,59,59,999)
  // console.log({endOfDay})

  const reservations= await Reservation.findAll(({
    where:{
      [Op.and]:[
        {check_in_date_time:{[Op.lt]:endOfDay}},
        {check_out_date_time:{[Op.gt]:startOfDay}},
      ],
      [Op.or]:[
        literal(
          `DATE(check_in_date_time::timestamp AT TIME ZONE 'Asia/Kolkata') = '${targetDate}'::date`
        ),
        literal(
          `DATE(check_out_date_time::timestamp AT TIME ZONE 'Asia/Kolkata')='${targetDate}'::date`),
        literal(
          `'${targetDate}'::date > DATE(check_in_date_time::timestamp AT TIME ZONE 'Asia/Kolkata') AND 
          '${targetDate}'::date < DATE(check_out_date_time::timestamp AT TIME ZONE 'Asia/Kolkata')`)
      ]
    }
  }))
  // console.log(reservations?.length)

  const bookedRoomId= new Set();
  for(const reservation of reservations){
    reservation.rooms.forEach((obj)=>bookedRoomId.add(obj.room_id))
  }
  // console.log(bookedRoomId)
  const allRooms=await RoomNumber.findAll()
  // console.log(allRooms.length,bookedRoomId)
  
  const roomWithStatus= allRooms.map(room=>{
    // console.log(bookedRoomId.has(room.id))
   return {
    ...room.toJSON(),
    room_status:bookedRoomId.has(room.id) ? "booked" :"available"
}})
  return roomWithStatus
}


const updateRoom = async (req) => {
  const { room_id } = req.params;
  if (!room_id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Room ID is required");
  }

  const room = await Room.findByPk(room_id);
  if (!room) {
    throw new ApiError(httpStatus.NOT_FOUND, "Room not found");
  }

  const {
    number_of_room,
    room_type,
    amenities,
    capacity,
    bed_count,
    bed_type,
    extra_bed,
    room_size,
    price,
  } = req.body;
console.log(" req.body", req.body)
  const imageUrl = req.files?.image?.[0]?.path ?? null;

  const toIntOrNull = (val) => {
    const parsed = parseInt(val);
    return isNaN(parsed) ? null : parsed;
  };

  const toFloatOrNull = (val) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? null : parsed;
  };

  const parseArrayField = (val) =>
    !val
      ? []
      : Array.isArray(val)
        ? val
        : val
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v);

  const amenitiesArray = parseArrayField(amenities).filter(isUuid);

  if (amenities && amenitiesArray.length > 0) {
    const found = await Amenity.findAll({ where: { id: amenitiesArray } });
    if (found.length !== amenitiesArray.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, "One or more amenity IDs are invalid");
    }
  }


  
  await room.update({
    number_of_room: toIntOrNull(number_of_room) ?? room.number_of_room,
    room_type: room_type ?? room.room_type,
    room_size: toIntOrNull(room_size) ?? room.room_size,
    amenities: amenities ? amenitiesArray : room.amenities,
    capacity: toIntOrNull(capacity) ?? room.capacity,
    bed_count: bed_count ? toIntOrNull(bed_count) : room.bed_count,
    bed_type: bed_type?.trim() || room.bed_type,
    extra_bed: extra_bed ? toIntOrNull(extra_bed) : room.extra_bed,
    price: toFloatOrNull(price) ?? room.price,
    image_url: imageUrl || room.image_url,
  });

  return room;
};

const updateRoomNumber = async (req) => {
  const { id } = req.params;
  const {
    room_number,
    room_status,
    floor_number,
    standard_checkout,
    room_type
  } = req.body;

  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Room ID is required");
  }

  const roomToUpdate = await RoomNumber.findByPk(id);
  if (!roomToUpdate) {
    throw new ApiError(httpStatus.NOT_FOUND, "Room not found");
  }
  const roomTypeDetails = await Room.findByPk(room_type);

  if (!roomTypeDetails) {
    throw new ApiError(httpStatus.NOT_FOUND, "Room type not found");
  }

  const existingRoomsCount = await RoomNumber.count({ where: { room_id: room_type } });
  if (existingRoomsCount >= roomTypeDetails.number_of_room) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Maximum ${roomTypeDetails.number_of_room} ${roomTypeDetails.room_type} rooms already created`
    );
  }

  await roomToUpdate.update({
    room_number: room_number ?? roomToUpdate.room_number,
    room_status: room_status ?? roomToUpdate.room_status,
    floor_number: floor_number ?? roomToUpdate.floor_number,
    stanndard_checkout: standard_checkout ?? roomToUpdate.stanndard_checkout,
    room_type: roomTypeDetails.room_type ?? roomToUpdate.room_type,
    room_id: room_type ?? roomToUpdate.room_id
  });

  return true;
};

const updateRoomStatusService = async (req) => {
  const { roomId } = req.params;
  const { status } = req.body;
  const room = await RoomNumber.findByPk(roomId);

  if (!room) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Room not found"
    );
  }

  if (room.room_status === status) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "You are already in same status"
    );
  }

  room.room_status = status;
  room.is_available = false
  await room.save();

  return data = {
    id: room.id,
    room_number: room.room_number,
    status: room.room_status,
  }
};

const getRoomStatus = async (req) => {
  const rooms = await Room.findAll({
    attributes: ['id', 'room_status']
  });
  return rooms;
}

const deleteRoomData = async (id) => {
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please provided valid identity");
  }
  const existRoom = await Room.findOne({ where: { id } })
  if (!existRoom) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Room is not exist");
  }
  await existRoom.destroy()
  return true
}

const deleteRoomNumberById = async (room_id) => {
  if (!room_id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please provided valid identity");
  }
  const existRoom = await RoomNumber.findByPk(room_id)
  if (!existRoom) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Room numbeer is not exist");
  }
  await existRoom.destroy()
  return true
}

const getRoomDetailById = async (id) => {
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please provide a valid ID and room number");
  }
  const room = await RoomNumber.findOne({
    where: { id },
    include: [
      {
        model: Room,
        as: 'room',
        attributes: ['capacity', 'room_type', 'description', 'amenities', 'extra_bed', 'price', 'room_size', 'bed_count', 'bed_type']
      }
    ]
  });
  if (!room) {
    throw new ApiError(httpStatus.NOT_FOUND, "Room not found");
  }
  return room;
};

const createOffer = async (data) => {
  const {
    offer_name,
    room_type_id,
    offer_type,
    valid_date_from,
    valid_date_to,
    discount_type,
    discount_value,
  } = data;

  const check_room_type = await Room.findOne({
    where: { id: room_type_id }
  })
  if (!check_room_type) {
    throw new ApiError(httpStatus.NOT_FOUND, "Please Provide the valide room type name");
  }

  const offer = await RoomPricing.create({
    offer_name,
    room_type_id: check_room_type.id,
    room_type: check_room_type.room_type,
    offer_type: offer_type || "seasonal",
    valid_date_from,
    valid_date_to,
    discount_type: discount_type || "percentage",
    discount_value,
  });

  return offer;
};

const getAllOffers = async (req) => {
  const {
    sortBy = 'created_at',
    sortOrder = 'desc',
    limit,
    page,
    room_type,
    offer_name
  } = req.query;

  const filter = {};
  const includeRoom = {
    model: Room,
    attributes: ['id', 'room_type'],
  };

  if (room_type) {
    includeRoom.where = {
      room_type: {
        [Op.iLike]: `${room_type}%`,
      },
    };
    includeRoom.required = true;
  }

  if (offer_name) {
    filter.offer_name = {
      [Op.iLike]: `${offer_name}%`
    };
  }
  const isPaginationEnabled = limit !== undefined && page !== undefined;

  const options = {
    sortBy: [[sortBy, sortOrder.toUpperCase()]],
    include: [includeRoom],
  };
  if (isPaginationEnabled) {
    options.limit = parseInt(limit, 10);
    options.page = parseInt(page, 10);
  }
  const { data, pagination } = await paginate(RoomPricing, filter, options);
  return { data, pagination };
};

const getOfferById = async (id) => {
  if (!id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Id is required");
  }
  const offer = await RoomPricing.findByPk(id);
  if (!offer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Offer not found");
  }
  return offer;
};

const updateOffer = async (id, data) => {
  const [_, [updatedOffer]] = await RoomPricing.update(data, {
    where: { id },
    returning: true,
  });

  return updatedOffer;
};

const deleteOffer = (id) => RoomPricing.destroy({ where: { id } });

const createPackage = async (body) => {
  const { room_ids, package_name, package_description, package_price } = body;

  const newPackage = await Package.create({
    name: package_name,
    description: package_description,
    price: package_price,
  });

  if (room_ids && room_ids.length > 0) {
    const roomPackageAssociations = room_ids.map((roomId) => ({
      room_id: roomId,
      package_id: newPackage.id,
    }));

    await RoomPackage.bulkCreate(roomPackageAssociations);
  }
}

const getAllPackages = async (req) => {
  const {
    sortBy = 'created_at',
    sortOrder = 'desc',
    limit,
    page,
    room_type,
    name,
  } = req.query;

  const filter = {};

  const isPaginationEnabled = limit !== undefined && page !== undefined;

  const includeRooms = {
    model: Room,
    as: 'rooms',
    attributes: ['id', 'room_type'],
    through: { attributes: [] },
  };

  if (room_type) {
    includeRooms.where = {
      room_type: {
        [Op.iLike]: `${room_type}%`,
      },
    };
    includeRooms.required = true;
  }

  if (name) {
    filter.name = { [Op.iLike]: `${name}%` };
  }

  const options = {
    sortBy: [[sortBy, sortOrder.toUpperCase()]],
    include: [includeRooms],
  };

  if (isPaginationEnabled) {
    options.limit = parseInt(limit, 10);
    options.page = parseInt(page, 10);
  }

  const { data, pagination } = await paginate(Package, filter, options);

  return { data, pagination };
};

const getPackageById = async (id) => {
  if (!id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Id is required");
  }
  const package = await Package.findByPk(id);
  if (!package) {
    throw new ApiError(httpStatus.NOT_FOUND, "Package not found");
  }
  return package;
};

const updatePackage = async (id, body) => {
  const { room_ids, package_name, package_description, package_price } = body;

  // Update the package
  const [affectedRows] = await Package.update(
    {
      name: package_name,
      description: package_description,
      price: package_price,
    },
    { where: { id } }
  );

  if (affectedRows === 0) {
    throw new Error("Package not found or no changes made");
  }

  //  Validate room_ids before using
  if (Array.isArray(room_ids)) {
    const validRooms = await Room.findAll({
      where: { id: room_ids },
    });

    const validRoomIds = validRooms.map((room) => room.id);

    if (validRoomIds.length !== room_ids.length) {
      throw new Error("One or more room_ids are invalid");
    }

    await RoomPackage.destroy({ where: { package_id: id } });

    const newAssociations = validRoomIds.map((roomId) => ({
      room_id: roomId,
      package_id: id,
    }));
    await RoomPackage.bulkCreate(newAssociations);
  }

  const updatedPackage = await Package.findByPk(id, {
    include: [
      {
        model: Room,
        as: "rooms",
        through: { attributes: [] },
      },
    ],
  });

  return updatedPackage;
};

const deletePackage = (id) => Package.destroy({ where: { id } });

const getRoomsWithOffers = async () => {
  const today = new Date();
  return await Room.findAll({
    include: [
      {
        model: RoomPricing,
        as: "pricing_offers",
        where: {
          valid_date_from: { [Op.lte]: today },
          valid_date_to: { [Op.gte]: today },
        },
        required: true,
      },
    ],
  });
};

const getAllRoomTypes = async () => {
  const room_types = await Room.findAll({
    attributes: ['id', 'room_type'],
  });
  return room_types;
};

const getAllRoomStatus = async () => {
  const statusList = Object.entries(RoomStatus).map(([key, value]) => ({
    key,
    value,
  }));
  return statusList
}

const allRooms = async (req) => {
  const { capacity, is_available, start_date, end_date } = req.query;
  console.log(capacity, "capacity")
  const whereCondition = {};
  let queryRoomNumber = {};
  if (capacity) {
    whereCondition.capacity = capacity;
  }
  if (start_date || end_date) {

    // Build the query object
    // let queryObj = {};
    // if (end_date) queryObj.check_in_date_time = { [Op.lt]: end_date };
    // if (start_date) queryObj.check_out_date_time = { [Op.gt]: start_date };

    // const overlappingReservations = await Reservation.findAll({
    //   where: whereCondition,
    //   attributes: ["rooms"],
    // });
    const overlappingReservations= await Reservation.findAll(({
      where:{
        [Op.and]:[
          {check_in_date_time:{[Op.lt]:end_date}},
          {check_out_date_time:{[Op.gt]:start_date}},
        ],
        [Op.or]:[
          literal(
            `DATE(check_in_date_time::timestamp AT TIME ZONE 'Asia/kolkata')='${end_date}'`),
          literal(
            `DATE(check_out_date_time::timestamp AT TIME ZONE 'Asia/kolkata')='${start_date}'`),
          literal(
            `'${end_date}'::date > DATE(check_in_date_time::timestamp AT TIME ZONE 'Asia/kolkata') AND 
            '${start_date}'::date < DATE(check_out_date_time::timestamp AT TIME ZONE 'Asia/kolkata')`)
        ]
      }
    }))

    let reservedRoomNumberIds = []
    overlappingReservations.forEach(r => {
      r.rooms?.forEach((item) => {
        reservedRoomNumberIds.push(item.room_id)
      })
    });

    if (reservedRoomNumberIds?.length > 0) {
      queryRoomNumber = {
        id: {
          [Op.notIn]: reservedRoomNumberIds,
        }
      };
    }
  }
  const rooms = await Room.findAll({
    where: whereCondition,
    include: {
      model: RoomNumber,
      as: "room",
      attributes: ['id', 'room_number'],
      where: queryRoomNumber
    },
    attributes: ['id', 'number_of_room', 'room_type', 'capacity'],
  });

  return rooms;
};

const getRoomAvailability = async (req, res) => {
  const { month, year, room_type_id } = req.body;

  if (!month || !year || !room_type_id) {
    return res.status(400).json({ message: "month, year, and room_type_id are required" });
  }

  const startOfMonth = dayjs(`${year}-${month}-01`).startOf("month");
  const endOfMonth = startOfMonth.endOf("month");

  const rooms = await RoomNumber.findAll({
    include: [
      {
        model: Room,
        as: "room",
        where: { id: room_type_id },
        attributes: ["id", "room_type"]
      },
      {
        model: Reservation,
        as: "reservations",
        where: {
          booking_status: {
            [Op.in]: ["booked", "check_in"]
          },
          [Op.or]: [
            {
              check_in_date_time: {
                [Op.between]: [startOfMonth.toDate(), endOfMonth.toDate()]
              }
            },
            {
              check_out_date_time: {
                [Op.between]: [startOfMonth.toDate(), endOfMonth.toDate()]
              }
            },
            {
              check_in_date_time: { [Op.lte]: startOfMonth.toDate() },
              check_out_date_time: { [Op.gte]: endOfMonth.toDate() }
            }
          ]
        },
        required: false
      }
    ]
  });

  const availability = {};

  for (let d = startOfMonth; d.isBefore(endOfMonth) || d.isSame(endOfMonth, 'day'); d = d.add(1, 'day')) {
    const dayStart = d.startOf("day");
    const dayEnd = d.endOf("day");
    const dateStr = d.format("YYYY-MM-DD");

    const availableRooms = rooms.filter(rn => {
      const isBooked = rn.reservations.some(reservation => {
        const resCheckIn = dayjs(reservation.check_in_date_time);
        const resCheckOut = dayjs(reservation.check_out_date_time);
        return (
          resCheckIn.isBefore(dayEnd) && resCheckOut.isAfter(dayStart)
        );
      });
      return !isBooked;
    });
    availability[dateStr] = availableRooms.length;
  }

  return { room_type_id, availability };
};
const getAllRoomNumberWithId = async () => {
  const all_room_no = await RoomNumber.findAll({
    where: { room_status: 'available' },
    attributes: ['id', 'room_number', 'room_status']
  })
  return all_room_no
}

module.exports = {
  createRooms, createRoomNumber, updateRoomNumber, getRoomDetailById, deleteRoomNumberById,
  getRoomList, createPackage, deletePackage, updatePackage, getPackageById, getAllRoomTypes, deleteRoomData, updateRoom, createOffer,
  getOfferById, deleteOffer, updateOffer, getAllOffers, updateRoomStatusService, getRoomStatus, getAllRoomType, getRoomsWithOffers, getAllPackages, getAllRoomTypewithOffers, getAllRoomStatus,
  allRooms, getRoomAvailability, getAllRoomNumberWithId
}
