const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const sendResponse = require("../utils/sendResponse");
const { GuestService } = require("../services");
const { Reservation, Guests, Sequelize } = require("../models");
const { Op } = require("sequelize");
const { Staff } = require('../models');
const bcrypt = require('bcryptjs');

const createGuestUser = catchAsync(async (req, res) => {
  const  { createdGuest, createdGuestDetail } = await GuestService.createGuestUser(req)
  if(!createdGuest || !createdGuestDetail){
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      message: "Something went wrong",
      success: false,
      data:  {}
    });
  }
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Guest data created successfully",
    success: true,
    data:  { createdGuest, createdGuestDetail }
  });
})

const getGuestUser = catchAsync(async (req, res) => {
  const { guests, pagination } = await GuestService.getAllGuest(req)
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "All Guest Data",
    success: true,
    data: { guests, pagination }
  });
})

const getGuestById = catchAsync(async (req, res) => {
  const {guestData, guestDetails,reservations,payments } = await GuestService.getGuestById(req)
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Guest Data get successfully",
    success: true,
    data:{guestData, guestDetails,
      reservations,
      payments}
  });
});

const deleteGuestDetails = catchAsync(async (req, res) => {
  const { id } = req.params;
  await GuestService.deleteGuestData(id);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Guest details deleted successfully",
    success: true,
    data: {},
  });
});


const updateGuestUser = catchAsync(async (req, res) => {
  const { updatedGuest, updatedGuestDetail } = await GuestService.updateGuestUser(req);

  if(!updatedGuest || !updatedGuestDetail){
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      message: "Somethig went wrong",
      success: false,
      data: {},
    });
  }
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Guest data updated successfully",
    success: true,
    data: { updatedGuest, updatedGuestDetail },
  });
});

const createStaffUser = catchAsync(async (req, res) => {
  const { first_name, last_name, email, phone, password, role } = req.body;
  if (!email || !password || !role) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Email, password, and role are required',
      success: false,
      data: {},
    });
  }
  const exist = await Staff.findOne({ where: { email } });
  if (exist) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      message: 'User already exists with this email',
      success: false,
      data: {},
    });
  }
  const hashedPassword = await bcrypt.hash(password, 8);
  const staff = await Staff.create({
    first_name,
    last_name,
    email,
    phone,
    password: hashedPassword,
    role,
    status: 'active',
  });
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Staff user created successfully',
    success: true,
    data: { staff },
  });
});

// const getTodayGuestUser = catchAsync(async (req, res) => {
//   const { guests, pagination } = await GuestService.getTodayGuestUser(req,res)
//   return sendResponse(res, {
//     statusCode: httpStatus.OK,
//     message: "All Guest Data",
//     success: true,
//     data: { guests, pagination }
//   });
// })
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
      },
      attributes: [
        "id",
        "guest_id",
        "check_in_date_time",
        "check_out_date_time"
      ],
      include: [
        {
          model: Guests,
          as: "guest",
          where: guestFilter,
          required: true,
          attributes: ["id", "first_name", "last_name", "email", "phone"]
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
  getGuestUser,
  getGuestById,
  updateGuestUser,
  deleteGuestDetails,
  getTodayGuestUser,
  createStaffUser
};
