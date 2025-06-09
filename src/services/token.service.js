const jwt = require("jsonwebtoken");
const moment = require("moment");
const httpStatus = require("http-status");
const config = require("../config/config");
const {  User } = require("../models"); // Import Sequelize models
const ApiError = require("../utils/ApiError");
const { tokenTypes } = require("../config/tokens.js");

/**
 * Generate token
 * @param {string} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (user, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: user.id,
    role: user.role,
    email: user.email,
    phone: user.phone,
    provider: user.provider,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(expires.valueOf() / 1000), // Math.floor((Date.now() + expires * 60 * 1000) / 1000),
    type,
  };

  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {string} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type, blacklisted = false) => {
//   const validType = type.toUpperCase();
//   const tokenDoc = await Token.create({
//     token,
//     userId,
//     type: validType,
//     expires: expires.toDate(),
//     blacklisted,
//   });
//   return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if invalid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
  try {
    const payload = jwt.verify(token, config.jwt.secret);

    if (type && payload.type !== type) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token type");
    }

    const tokenDoc = await User.findOne({
      where: { id: payload.sub },
    });
    if (!tokenDoc) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Token not found or invalid");
    }

    return tokenDoc;
  } catch (error) {
    console.error("Token verification error:", error);
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
  }
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokensAdmin = async (admin) => {
  const accessTokenExpires = moment().add(
    config.jwt.accessExpirationMinutes,
    "minutes"
  );
  const accessToken = generateToken(
    admin,
    accessTokenExpires,
    tokenTypes.ACCESS
  );

  const refreshTokenExpires = moment().add(
    config.jwt.refreshExpirationDays,
    "days"
  );
  const refreshToken = generateToken(
    admin,
    refreshTokenExpires,
    tokenTypes.REFRESH
  );

  await admin.update({
    access_token: accessToken,
    access_token_expiry: accessTokenExpires.toDate(),
    refresh_token: refreshToken,
    refresh_token_expiry: refreshTokenExpires.toDate(),
  });

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(
    config.jwt.accessExpirationMinutes,
    "minutes"
  );
  const accessToken = generateToken(
    user,
    accessTokenExpires,
    tokenTypes.ACCESS
  );

  const refreshTokenExpires = moment().add(
    config.jwt.refreshExpirationDays,
    "days"
  );
  const refreshToken = generateToken(
    user,
    refreshTokenExpires,
    tokenTypes.REFRESH
  );

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "No users found with this email");
  }

  const expires = moment().add(
    config.jwt.resetPasswordExpirationMinutes,
    "minutes"
  );
  const resetPasswordToken = generateToken(
    user.id,
    expires,
    tokenTypes.RESET_PASSWORD
  );
  await saveToken(
    resetPasswordToken,
    user.id,
    expires,
    tokenTypes.RESET_PASSWORD
  );

  return resetPasswordToken;
};

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateAuthTokensAdmin,
};
