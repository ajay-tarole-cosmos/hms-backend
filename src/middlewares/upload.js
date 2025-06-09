const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "user_uploads",
    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    resource_type: 'auto',
    allowed_formats: ["pdf", "jpeg", "png"], 
  }),
});

// File filter for MIME types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPEG, and PNG files are allowed."), false);
  }
};

// ✅ Set 2MB size limit
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB in bytes
});

module.exports = upload;