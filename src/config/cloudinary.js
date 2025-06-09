const config = require("./config");

const cloudinary = require("cloudinary").v2;

cloudinary.config(config.cloudinary);

module.exports = cloudinary;
