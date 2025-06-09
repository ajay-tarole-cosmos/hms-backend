const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Staff } = require('../models');
const { generateAuthTokens } = require('../services/token.service');
const { sendResetPasswordEmail, sendOtpEmail } = require('../services/email.service');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');
const { v4: uuidv4 } = require('uuid');
const { authenticateUser, authorizeRoles } = require('../middlewares/authMiddleware');

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await Staff.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  const tokens = await generateAuthTokens(user);
  res.status(httpStatus.OK).json({ user: { id: user.id, name: user.first_name + ' ' + user.last_name, email: user.email, role: user.role }, tokens });
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
  user.password = await bcrypt.hash(password, 8);
  user.otp = null;
  user.otp_expiry = null;
  user.otp_verified = false;
  await user.save();
  res.status(httpStatus.OK).json({ message: 'Password reset successful' });
});

const createUserBySuperAdmin = [
  authenticateUser,
  authorizeRoles('super_admin'),
  catchAsync(async (req, res) => {
    const { first_name, last_name, email, phone, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Email, password, and role are required' });
    }
    const exist = await Staff.findOne({ where: { email } });
    if (exist) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'User already exists with this email' });
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
    res.status(httpStatus.OK).json({ message: 'User created successfully', staff });
  })
];

module.exports = { login, forgotPassword, verifyOtp, resetPassword, createUserBySuperAdmin };