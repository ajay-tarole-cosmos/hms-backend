
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");

const authenticateUserSelf = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; 
        if (!token) {
          throw new ApiError(
            httpStatus.UNAUTHORIZED,
           "Unauthorized: No token provided" 
          );
        }    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized: Invalid token");
  }
};

const authorizeSelfOnly = (req, res, next) => {
  const userIdFromToken = req.user.sub;
  const userIdFromParams = req.params.id;

  if (userIdFromToken !== userIdFromParams) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden: You can only update your own profile");
  }

  next();
};

module.exports = {authenticateUserSelf,authorizeSelfOnly};
