const express = require('express');
const router = express.Router();
const CoverImage = require('../model/CoverImage');
const upload = require('../middleware/multerConfig');

// Upload cover image
router.post('/upload', upload.single('coverImage'), async (req, res) => {
  try {
    console.log('Cover image upload route accessed');

    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imagePath = `/Uploads/BlogCover/${req.file.filename}`;
    console.log(`Upload successful, path: ${imagePath}`);

    const coverImage = new CoverImage({ path: imagePath });
    await coverImage.save();
    console.log('Saved cover image to MongoDB:', coverImage);

    res.status(200).json({ path: imagePath });
  } catch (error) {
    console.error('Error uploading cover image:', error);
    res.status(500).json({ message: error.message || 'Server error when uploading cover image' });
  }
});

// Get all cover images
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all cover images');
    const coverImages = await CoverImage.find({}, 'path createdAt').sort({ createdAt: -1 });
    console.log('Retrieved cover images:', coverImages);
    res.status(200).json(coverImages);
  } catch (error) {
    console.error('Error fetching cover images:', error);
    res.status(500).json({ message: error.message || 'Server error when fetching cover images' });
  }
});

module.exports = router;