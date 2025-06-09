const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

const checkUserStatus = (user) => {
  if (!user || typeof user !== 'object') {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not found.");
  }

  if (user.is_deleted) {
    throw new ApiError(httpStatus.FORBIDDEN, "Your account has been deleted. Please contact support.");
  }

  if (!user.is_active) {
    throw new ApiError(httpStatus.FORBIDDEN, "Your account is inactive. Please contact support.");
  }
};

module.exports = checkUserStatus;
