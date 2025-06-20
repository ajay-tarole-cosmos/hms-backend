const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "user_uploads",
    public_id: `${Date.now()}-2`,
    // public_id: `${Date.now()}-${(file?.originalname || '').split(".")[0]}`,
    resource_type: 'auto',
    allowed_formats: ["pdf", "jpeg", "png"], 
  }),
});

// File filter for MIME types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
  if (allowedMimeTypes.includes(file?.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPEG, and PNG files are allowed."), false);
  }
};

// Configure multer for multiple file upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 5 // Maximum 5 files
  }
});

module.exports = upload;