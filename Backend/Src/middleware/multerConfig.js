const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'Uploads', 'BlogCover');
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

const upload = multer({
  storage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
  },
  fileFilter: function (req, file, cb) {
    // Allowed image MIME types
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    // Common video MIME types to block
    const videoMimeTypes = [
      'video/mp4',
      'video/mpeg',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
      'video/mkv',
    ];

    const mimetype = file.mimetype;
    const extname = path.extname(file.originalname).toLowerCase();

    // Check for video MIME types
    if (videoMimeTypes.includes(mimetype)) {
      console.error(`Blocked video upload attempt: ${file.originalname} (MIME: ${mimetype})`);
      return cb(new Error('Videos are not allowed. Please upload a JPEG, PNG, or WebP image.'));
    }

    // Check for allowed image types
    if (allowedMimeTypes.includes(mimetype) && ['.jpeg', '.jpg', '.png', '.webp'].includes(extname)) {
      console.log(`Valid image file: ${file.originalname} (MIME: ${mimetype}, Ext: ${extname})`);
      return cb(null, true);
    }

    console.error(`Invalid file type: ${file.originalname} (MIME: ${mimetype}, Ext: ${extname})`);
    cb(new Error('Only JPEG, PNG, or WebP images are allowed'));
  },
});

module.exports = upload;