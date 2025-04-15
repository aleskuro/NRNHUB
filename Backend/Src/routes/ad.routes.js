const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');

router.post('/upload', upload.single('adImage'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const imagePath = `/uploads/ads/${req.file.filename}`;
  res.json({ path: imagePath });
});

module.exports = router;