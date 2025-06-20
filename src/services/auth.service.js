const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SuperAdmin } = require('../models');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const config = require('../config/config');

const hashPassword = async (password) => {
  return bcrypt.hash(password, 8);
};

const validatePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

const generateResetToken = (userId) => {
  return jwt.sign({ sub: userId, type: 'reset' }, config.jwt.secret, { expiresIn: '1h' });
};

const resetPassword = async (token, newPassword) => {
  let payload;
  try {
    payload = jwt.verify(token, config.jwt.secret);
  } catch (e) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired reset token');
  }
  const user = await SuperAdmin.findByPk(payload.sub);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  user.password = await hashPassword(newPassword);
  await user.save();
  return true;
};

module.exports = { hashPassword, validatePassword, generateResetToken, resetPassword }; 