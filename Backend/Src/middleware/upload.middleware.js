const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the upload directory
const uploadDir = 'C:\\Users\\user\\Desktop\\nnrnhub\\Backend\\Uploads\\ads';

// Ensure the upload directory exists
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created upload directory: ${uploadDir}`);
  }
} catch (err) {
  console.error(`Failed to create upload directory ${uploadDir}:`, err);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Verify directory accessibility
    fs.access(uploadDir, fs.constants.W_OK, (err) => {
      if (err) {
        console.error(`Upload directory ${uploadDir} is not writable:`, err);
        return cb(err);
      }
      console.log(`Uploading to: ${uploadDir}`);
      cb(null, uploadDir);
    });
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    console.log(`Saving file as: ${filename}`);
    cb(null, filename);
  },
});

const upload = multer({ storage });
module.exports = upload;