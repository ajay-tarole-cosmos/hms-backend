const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const paginate = require("../models/plugins/paginate.plugin");
const { Sequelize, Op, } = require('sequelize');
const generateUniqueBookingId = require("../utils/UniqueBookingId");
const { Payments, Guests, Reservation, GuestDetail } = require('../models/')

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<Guests>}
 */

const createGuest = async (data) => {
  const { email, phone } = data;

  const existGuest = await Guests.findOne({
    where: {
      [Op.or]: [{ email }, { phone }],
    },
  });

  if (existGuest) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Guest already exists with the provided email or phone number.");
  }

  const createdStatus = await Guests.create({
    ...data,
    guest_vip: false,
  });

  return createdStatus;
};


const createGuestUser = async (req) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    country_code,
    fatherName,
    gender,
    occupation,
    date_of_birth,
    nationality,
    state,
    city,
    zip_code,
    address,
    comment,
    document_type,
    agent_name,
    booking_source,
  } = req.body;
  if (!firstName || !lastName) {
    throw new ApiError(httpStatus.BAD_REQUEST, "firstName and lastName are required.");
  }

  const existGuest = await Guests.findOne({
    where: {
      [Op.or]: [
        { phone },
        { email }
      ]
    }
  })
  if (existGuest) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Guest already exists with the provided email or phone number.");
    // throw new ApiError(httpStatus.BAD_REQUEST, "Guest already exists with the provided email or phone number.", isOperational = false, stack = '');
  }
  const document = req.files?.document || [];


  const createdGuest = await Guests.create({
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    country_code,
    father_name: fatherName,
    gender,
    occupation,
    date_of_birth,
    nationality,
    guest_vip: false,
    agent_name,
    booking_source
  });
  let createdGuestDetail = null
  if (createdGuest) {
    createdGuestDetail = await GuestDetail.create({
      guest_id: createdGuest.id,
      state,
      city,
      zip_code,
      address,
      comment,
      frontend_url: document[0]?.path || null,
      mime_type: document[0]?.mimetype || null,
      document_type,
    });
    if (!createdGuestDetail) {
      throw new ApiError(httpStatus.BAD_REQUEST, "User could not be created.");
    }
  }

  return { createdGuest, createdGuestDetail };
};

const getAllGuest = async (req) => {
  const {
    name,
    phone,
    sortBy = 'created_at',
    sortOrder = 'desc',
    limit,
    page,
    email,
  } = req.query;

  const filter = {};
  const orConditions = [];

  if (name) {
    const lowerName = name.toLowerCase();
    orConditions.push(
      Sequelize.where(Sequelize.fn('lower', Sequelize.col('first_name')), {
        [Op.like]: `%${lowerName}%`,
      }),
      Sequelize.where(Sequelize.fn('lower', Sequelize.col('last_name')), {
        [Op.like]: `%${lowerName}%`,
      }),
      Sequelize.where(
        Sequelize.fn(
          'LOWER',
          Sequelize.fn(
            'concat',
            Sequelize.col('first_name'),
            ' ',
            Sequelize.col('last_name')
          )
        ),
        {
          [Op.like]: `%${lowerName}%`,
        }
      )
    );
  }

  if (phone) {
    orConditions.push({
      phone: {
        [Op.iLike]: `${phone}%`,
      },
    });
  }
  if (email) {
    orConditions.push({
      email: {
        [Op.iLike]: `${email}%`,
      },
    });
  }

  if (orConditions.length > 0) {
    filter[Op.or] = orConditions;
  }

  const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const getSortExpression = (field) => {
    return [Sequelize.col(field), sortDirection];
  };
  filter.is_deleted = false;
  const isPaginationEnabled = limit !== undefined && page !== undefined;


  const include = [
    {
        model: GuestDetail,
        as: 'guest_details',
    }
  ]
  const options = {
    sortBy: [getSortExpression(sortBy)],
    include,
  };
  if (isPaginationEnabled) {
    options.limit = parseInt(limit, 10);
    options.page = parseInt(page, 10);
  }
  const { data, pagination } = await paginate(Guests, filter, options);
  const guests = data.map((user) => user.get({ plain: true }));
  return { guests, pagination };
};

const updateGuest = async (id, updateData) => {
  try {
    if (!id) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Please provide valide identity");
    }
    const { firstName, lastName, email, phone, country_code, fatherName, gender, occupation, date_of_birth, nationality } = updateData;
    const guest = await Guests.findOne({ where: { id } })
    if (!guest) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Guest not exist");
    }
    if (firstName !== undefined) guest.first_name = firstName === "" ? null : firstName;
    if (lastName !== undefined) guest.last_name = lastName === "" ? null : lastName;

    if (email !== undefined) guest.email = email === "" ? null : email;
    if (country_code !== undefined) guest.country_code = country_code === "" ? null : country_code;
    if (phone !== undefined) guest.phone = phone === "" ? null : phone;
    if (fatherName !== undefined) guest.father_name = fatherName === "" ? null : fatherName;
    if (gender !== undefined) guest.gender = gender === "" ? null : gender;
    if (occupation !== undefined) guest.occupation = occupation === "" ? null : occupation;
    if (date_of_birth !== undefined) guest.date_of_birth = date_of_birth === "" ? null : date_of_birth;
    if (nationality !== undefined) guest.nationality = nationality === "" ? null : nationality;


    await guest.save();
    return guest;
  } catch (error) {
    throw new Error("Failed to update guest. Please provide valide Guest indentity");
  }
}

const deleteGuestData = async (id) => {
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please provided valid identity");
  }
  const guest = await Guests.findOne({ where: { id } })
  if (!guest) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Guest detail not exist");
  }
  const set_date = new Date()
  const change_type = set_date.toISOString();

  await guest.update({
    is_deleted: true,
    deleted_by: guest.id,           // Id of deleted by will be change in future
    date_of_delete: change_type
  });
  // await guest.destroy()
  return true
}

const getGuestById = async (req) => {
  const { guestId } = req.params;
  if (!guestId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Guest Id is required.");
  }

  const guestData = await Guests.findByPk(guestId);
  if (!guestData) {
    throw new ApiError(httpStatus.NOT_FOUND, "Guest does not exist.");
  }

  const guestDetails = await GuestDetail.findOne({
    where: { guest_id: guestData.id }
  });

  let reservations = [];
  let payments = [];

  // Only query reservation and payments if guestDetails exist
  if (guestDetails) {
    reservations = await Reservation.findAll({
      where: { guest_id: guestData.id }
    });

    const reservationIds = reservations.map(res => res.id);

    payments = await Payments.findAll({
      where: {
        [Op.or]: [
          { guest_id: guestData.id },
          // { booking_id: { [Op.in]: reservationIds } }
        ]
      }
    });
  }

  // Return the data
  return {
    guestData,
    guestDetails,
    reservations,
    payments
  };
};


const updateGuestUser = async (req) => {
  const guestId = req.params.id;
  if (!guestId) {
    throw new ApiError(httpStatus.NOT_FOUND, "Guest Id is required");
  }
  const {
    firstName,
    lastName,
    email,
    phone,
    country_code,
    fatherName,
    gender,
    occupation,
    date_of_birth,
    nationality,
    state,
    city,
    zip_code,
    address,
    comment,
    document_type,
  } = req.body;

  const document = req.files?.document || [];

  //  Check if Guest exists
  const guest = await Guests.findByPk(guestId);
  if (!guest) {
    throw new ApiError(httpStatus.NOT_FOUND, "Guest not found");
  }
  //  Update Guest
  const updatedGuest = await guest.update({
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    country_code,
    father_name: fatherName,
    gender,
    occupation,
    date_of_birth,
    nationality,
  });

  //  Update or create GuestDetail
  let guestDetail = await GuestDetail.findOne({ where: { guest_id: guestId } });

  const detailData = {
    state,
    city,
    zip_code,
    address,
    comment,
    document_type,
  };

  if (document.length > 0) {
    detailData.frontend_url = document[0].path;
    detailData.mime_type = document[0].mimetype;
  }

  let updatedGuestDetail;
  if (guestDetail) {
    updatedGuestDetail = await guestDetail.update(detailData);
  } else {
    updatedGuestDetail = await GuestDetail.create({
      ...detailData,
      guest_id: guestId,
    });
  }

  return { updatedGuest, updatedGuestDetail };
};

const updateMultipleGuests = async (guestsData = []) => {
  const updatePromises = guestsData.map(async (guest) => {
    const { id, guestFullDetail = [], ...updateFields } = guest;
    if (!id) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Each guest must have an id for update');
    }

    const existingGuest = await Guests.findByPk(id);

    if (!existingGuest) {
      throw new ApiError(httpStatus.NOT_FOUND, `Guest with id ${id} not found`);
    }

    await existingGuest.update(updateFields);
    if (Array.isArray(guestFullDetail)) {
      await Promise.all(
        guestFullDetail.map(async (detail) => {
          const [guestDetail, created] = await GuestDetail.findOne({
            where: {
              guest_id: id,
              // document_type: detail.document_type,
            },
            defaults: {
              ...detail,
              guest_id: id,
            },
          });

          if (!created) {
            await guestDetail.update(detail);
          }
        })
      );
    }

    return existingGuest;
  });

  return Promise.all(updatePromises);
};

// const getTodayGuestUser= async (req) => {
//   const {
//     name,
//     phone,
//     sortBy = 'created_at',
//     sortOrder = 'desc',
//     limit,
//     page,
//     email,
//   } = req.query;

//   const filter = {};
//   const orConditions = [];

//   if (name) {
//     const lowerName = name.toLowerCase();
//     orConditions.push(
//       Sequelize.where(Sequelize.fn('lower', Sequelize.col('first_name')), {
//         [Op.like]: `%${lowerName}%`,
//       }),
//       Sequelize.where(Sequelize.fn('lower', Sequelize.col('last_name')), {
//         [Op.like]: `%${lowerName}%`,
//       }),
//       Sequelize.where(
//         Sequelize.fn(
//           'LOWER',
//           Sequelize.fn(
//             'concat',
//             Sequelize.col('first_name'),
//             ' ',
//             Sequelize.col('last_name')
//           )
//         ),
//         {
//           [Op.like]: `%${lowerName}%`,
//         }
//       )
//     );
//   }

//   if (phone) {
//     orConditions.push({
//       phone: {
//         [Op.iLike]: `${phone}%`,
//       },
//     });
//   }
//   if (email) {
//     orConditions.push({
//       email: {
//         [Op.iLike]: `${email}%`,
//       },
//     });
//   }

//   if (orConditions.length > 0) {
//     filter[Op.or] = orConditions;
//   }

//   const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
//   const getSortExpression = (field) => {
//     return [Sequelize.col(field), sortDirection];
//   };

//   const startOfToday = new Date();
// startOfToday.setHours(0, 0, 0, 0);

// const endOfToday = new Date();
// endOfToday.setHours(23, 59, 59, 999);

// // Add condition to include only those checked in today
// include[0].where = {
//   check_in_date_time: {
//     [Op.between]: [startOfToday, endOfToday],
//   },
// };

//   filter.is_deleted = false;
//   const isPaginationEnabled = limit !== undefined && page !== undefined;


//   const options = {
//     sortBy: [getSortExpression(sortBy)],
//     include,
//   };
//   if (isPaginationEnabled) {
//     options.limit = parseInt(limit, 10);
//     options.page = parseInt(page, 10);
//   }
//   const { data, pagination } = await paginate(Guests, filter, options);
//   const guests = data.map((user) => user.get({ plain: true }));
//   return { guests, pagination };
// };

const getTodayGuestUser = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      page = 1,
      limit = 10,
      sortBy = "check_in_date_time",
      sortOrder = "desc",
    } = req.query;

    const offset = (page - 1) * limit;
    const sortDirection = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

    const guestFilter = {
      is_deleted: false,
    };

    if (name) {
      const lowerName = name.toLowerCase();
      guestFilter[Op.or] = [
        Sequelize.where(Sequelize.fn("lower", Sequelize.col("first_name")), {
          [Op.like]: `%${lowerName}%`,
        }),
        Sequelize.where(Sequelize.fn("lower", Sequelize.col("last_name")), {
          [Op.like]: `%${lowerName}%`,
        }),
        Sequelize.where(
          Sequelize.fn(
            "lower",
            Sequelize.fn("concat", Sequelize.col("first_name"), " ", Sequelize.col("last_name"))
          ),
          {
            [Op.like]: `%${lowerName}%`,
          }
        ),
      ];
    }

    if (phone) {
      guestFilter.phone = { [Op.iLike]: `${phone}%` };
    }

    if (email) {
      guestFilter.email = { [Op.iLike]: `${email}%` };
    }

    const { count, rows } = await Reservation.findAndCountAll({
      where: {
        booking_status: "check_in",
        check_in_date_time: { [Op.ne]: null },
        // Optional: to get only active ones still staying
        // checked_out_at: null,
      },
      include: [
        {
          model: Guests,
          as: "guest",
          where: guestFilter,
          required: true,
        },
      ],
      order: [[sortBy, sortDirection]],
      offset,
      limit: parseInt(limit, 10),
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      message: "Guests currently checked in",
      data: rows,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: parseInt(page, 10),
        pageSize: parseInt(limit, 10),
      },
    });
  } catch (error) {
    console.error("Error fetching checked-in guests:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createGuestUser,
  getAllGuest,
  getGuestById,
  deleteGuestData,
  updateGuestUser,
  updateGuest,
  createGuest,
  updateMultipleGuests,
  getTodayGuestUser
};
