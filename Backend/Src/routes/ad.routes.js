const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');

router.post('/upload', upload.single('adImage'), (req, res) => {
  if (!req.file) {
    console.error('No file uploaded');
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const imagePath = `/Uploads/ads/${req.file.filename}`;
  console.log(`Upload successful, returning path: ${imagePath}`);
  res.json({ path: imagePath });
});

module.exports = router;