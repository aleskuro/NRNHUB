const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'Uploads', 'ads');
console.log(`Resolved uploadDir: ${uploadDir}`);

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
    fs.access(uploadDir, fs.constants.W_OK, (err) => {
      if (err) {
        console.error(`Upload directory ${uploadDir} is not writable:`, err);
        return cb(new Error('Upload directory is not writable'));
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