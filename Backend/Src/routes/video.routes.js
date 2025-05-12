const express = require('express');
const router = express.Router();
const Video = require('../model/video.model'); // Updated path (singular 'model')

// Create a new video
router.post('/', async (req, res) => {
  try {
    const { title, embedUrl, category, description } = req.body;

    if (!title || !embedUrl || !category) {
      return res.status(400).json({ message: 'Title, embed URL, and category are required' });
    }

    const video = new Video({
      title,
      embedUrl,
      category,
      description,
    });

    await video.save();
    res.status(201).json({ message: 'Video created successfully', video });
  } catch (error) {
    res.status(500).json({ message: 'Error creating video', error: error.message });
  }
});

// Get all videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos', error: error.message });
  }
});

// Get videos by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = ['Interview', 'Video', 'Motivation', 'Eduhub', 'Finance', 'Health', 'Other'];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const videos = await Video.find({ category }).sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos by category', error: error.message });
  }
});

// Update a video
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, embedUrl, category, description } = req.body;

    const video = await Video.findByIdAndUpdate(
      id,
      { title, embedUrl, category, description, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.status(200).json({ message: 'Video updated successfully', video });
  } catch (error) {
    res.status(500).json({ message: 'Error updating video', error: error.message });
  }
});

// Delete a video
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findByIdAndDelete(id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting video', error: error.message });
  }
});

module.exports = router;