const httpStatus = require('http-status');
const bcrypt = require('bcrypt');
const { Staff, sequelize } = require('../models');
const { generateAuthTokens } = require('../services/token.service');
const { sendOtpEmail } = require('../services/email.service');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { setPermissions } = require('../middlewares/permissionManager');
const defaultPermissions = require('../utils/defaultPermissions');
const sendResponse = require('../utils/sendResponse');


const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const staff = await Staff.findOne({ where: { email } });
  if (!staff || staff.status !== 'active') {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, staff.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const tokens = await generateAuthTokens({
    id: staff.id,
    email: staff.email,
    role: staff.role,
    department_id: staff.department_id,
    has_global_access: staff.has_global_access
  });

  staff.access_token = tokens.access.token;
  staff.refresh_token = tokens.refresh.token;
  await staff.save();

  return res.json({
    access_token: tokens.access.token,
    refresh_token: tokens.refresh.token,
    staff: {
      id: staff.id,
      first_name: staff.first_name,
      last_name: staff.last_name,
      email: staff.email,
      role: staff.role,
      hotel_id: staff.hotel_id,
    },
  });
});

const logout = catchAsync(async (req, res) => {
  const user = req.user;

  const staff = await Staff.findByPk(user.id);
  if (!staff) {
    return res.status(404).json({ message: 'User not found' });
  }

  staff.access_token = null;
  staff.refresh_token = null;
  await staff.save();

  res.status(200).json({ message: 'Logged out successfully' });
});


const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await Staff.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No user found with this email');
  }
  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  user.otp = otp;
  user.otp_expiry = expiry;
  await user.save();
  await sendOtpEmail(user.email, otp);
  res.status(httpStatus.OK).json({ message: 'OTP sent to email' });
});

const verifyOtp = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const user = await Staff.findOne({ where: { email } });
  if (!user || !user.otp || !user.otp_expiry) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP not requested or expired');
  }
  if (user.otp !== otp || new Date() > user.otp_expiry) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired OTP');
  }
  // Do NOT clear OTP here; only mark as verified (optional: set a flag)
  user.otp_verified = true;
  await user.save();
  res.status(httpStatus.OK).json({ message: 'OTP verified successfully' });
});

const resetPassword = catchAsync(async (req, res) => {
  const { email, otp, password } = req.body;
  const user = await Staff.findOne({ where: { email } });
  if (!user || !user.otp || !user.otp_expiry) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP not requested or expired');
  }
  if (user.otp !== otp || new Date() > user.otp_expiry) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired OTP');
  }

  if (!user.otp_verified) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'OTP not verified');
  }

  user.password = await bcrypt.hash(password, 8);
  user.otp = null;
  user.otp_expiry = null;
  user.otp_verified = false;
  await user.save();

  res.status(httpStatus.OK).json({ message: 'Password reset successful' });
});

const createUser = (catchAsync(async (req, res) => {
  const creator = req.user;
  const { first_name, last_name, email, phone, password, role, hotel_id, global_access, department_id, permissions } = req.body;
  if (!email || !password || !role) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Email, password, and role are required' });
  }
  console.log("req.body", req.body)
  const exist = await Staff.findOne({ where: { email } });
  if (exist) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'User already exists with this email' });
  }

  // Validate role assignment
  const allowedRolesForAdmin = ['front_desk', 'housekeeping', 'restaurant_manager', 'waiter', 'inventory_manager', 'finance', 'auditor',"manager"];
  if (
    creator.role === 'admin' &&
    !allowedRolesForAdmin.includes(role)
  ) {
    return res.status(httpStatus.FORBIDDEN).json({
      message: `Admin can only assign roles: ${allowedRolesForAdmin.join(', ')}`,
    });
  }
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Permissions are required and must be a non-empty array',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const staff = await Staff.create({
    first_name,
    last_name,
    email,
    phone,
    password: hashedPassword,
    role,
    status: 'active',
    hotel_id: creator.hotel_id || hotel_id,
    has_global_access:global_access,
    department_id
  });


  await setPermissions(staff.id, permissions);

  res.status(httpStatus.OK).json({
    message: 'Staff user created successfully',
    staff,
  });
}))

const assignPermissions = async (req, res) => {
  const staffId = req.query.staffId;
  const { permissions } = req.body;
  console.log("staffId", staffId)
  /*
    permissions = [
      {
        resource: 'reservations',
        can_view: true,
        can_add: true,
        can_update: false,
        can_delete: false
      },
      {
        resource: 'rooms',
        can_view: true,
        can_add: false,
        ...
      }
    ]
  */

  await setPermissions(staffId, permissions);
  res.status(200).json({ success: true, message: 'Permissions assigned successfully' });
};

const getStaffPermissions = catchAsync(async (req, res) => {
  const { staffId } = req.params;
  console.log("staff id", staffId)
  const staff = await Staff.findByPk(staffId);

  const [results] = await sequelize.query(`
    SELECT
      r.resource,
      COALESCE(p.can_view, false) AS can_view,
      COALESCE(p.can_add, false) AS can_add,
      COALESCE(p.can_update, false) AS can_update,
      COALESCE(p.can_delete, false) AS can_delete
    FROM (
      SELECT DISTINCT resource FROM staff_permissions
    ) r
    LEFT JOIN staff_permissions p
    ON p.resource = r.resource AND p.staff_id = :staffId
  `, {
    replacements: { staffId },
  });

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Permissions fetched successfully',
    data: {
      staffId: staffId,
      department_id: staff.department_id,
      global_access: staff.has_global_access,
      permissions: results
    },
  });
});

const getStaff = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const staff = await Staff.findAndCountAll({
    limit,
    offset,
    attributes: {
      exclude: [
        'password',
        'otp',
        'otp_expiry',
        'otp_verified',
        'access_token',
        'refresh_token',
        'created_at',
        'updated_at'
      ]
    }
  });

  return res.status(200).json({
    success: true,
    data: staff.rows,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(staff.count / limit),
      totalResults: staff.count
    }
  });
};

const getDefaultPermissions = (req, res) => {
  const role = req.params.role?.toLowerCase();
  console.log("role", role);
  if (!role) {
    return res.status(400).json({ success: false, message: 'Role is required' });
  }

  const permissions = defaultPermissions[role];

  if (!permissions) {
    return res.status(404).json({ success: false, message: 'Role not found' });
  }

  return res.status(200).json({ success: true, role, permissions });
};

module.exports = { login, logout, forgotPassword, verifyOtp, resetPassword, assignPermissions, createUser, getStaffPermissions, getStaff, getDefaultPermissions };