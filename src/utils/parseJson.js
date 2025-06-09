const httpStatus = require("http-status");
const ApiError = require("./ApiError");

const safeJSON = (value) => {
    if (!value || value === "undefined") return null;
    try {
      return JSON.parse(value);
    } catch (err) {
      console.warn("Invalid JSON:", value);
      throw new ApiError(httpStatus.BAD_REQUEST, err);
    }
  };
  
  const cleanString = (str) => {
    if (!str || str === "undefined") return null;
    return str.replace(/^"|"$/g, "");
  };

 module.exports={
    safeJSON,
    cleanString
  }