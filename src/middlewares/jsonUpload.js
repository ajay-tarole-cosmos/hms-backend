const multer = require("multer");

const jsonUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/json") cb(null, true);
    else cb(new Error("Only JSON files are allowed"), false);
  },
});

module.exports = jsonUpload;
