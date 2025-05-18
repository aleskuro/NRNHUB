const express = require('express');
const router = express.Router();
const Ad = require('../model/Ad');
const AdInquiry = require('../model/AdInquiry');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Base URL from environment variable
const BASE_URL = process.env.BASE_URL;

// Middleware for admin authentication
const authAdminMiddleware = (req, res, next) => {
  const isAdmin = true; // Placeholder: Replace with JWT verification
  if (!isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Configure multer for ad uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'Uploads', 'ads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `adImage-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, PNG, GIF, or WebP images are allowed'));
  },
}).single('adImage');

// Valid ad types
const validAdTypes = [
  'mobile', 'right1', 'right2', 'right3', 'right4', 'right5',
  'left1', 'left2', 'left3', 'left4', 'left5', 'bottom',
  'navbar', 'hero', 'blogsFirst', 'blogsSecond', 'blogsThird',
  'blogsFourth', 'blogsFifth', 'blogsHome1', 'blogsHome2', 'blogsHome3',
  'economyAds1', 'economyAds2', 'lifestyle1', 'lifestyle2'
];

// Test route
router.get('/test', (req, res) => {
  res.json({ status: 'Ad routes are working' });
});

// Get ads
router.get('/', async (req, res) => {
  try {
    let ad = await Ad.findOne().lean();
    console.log('Fetched ad from MongoDB:', JSON.stringify(ad, null, 2));

    if (!ad) {
      console.log('No ad document found, returning defaults');
      const defaults = {
        adImages: {},
        adLinks: {},
        visibility: {},
        ...validAdTypes.reduce((acc, key) => ({ ...acc, [`${key}AdVisible`]: false }), {}),
      };
      console.log('Sending default ad response:', JSON.stringify(defaults, null, 2));
      return res.json(defaults);
    }

    const response = {
      adImages: ad.adImages || {},
      adLinks: ad.adLinks || {},
      visibility: ad.visibility || {},
    };

    Object.keys(response).forEach((field) => {
      Object.keys(response[field]).forEach((key) => {
        if (key.startsWith('$')) delete response[field][key];
      });
    });

    validAdTypes.forEach((key) => {
      response[`${key}AdVisible`] = Boolean(response.visibility[key]);
    });

    console.log('Sending ad response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({ message: 'Server error when fetching ads', error: error.message });
  }
});

// Upload ad image
router.post('/upload', upload, async (req, res) => {
  try {
    console.log('Upload request received:', { file: req.file, body: req.body });
    if (!req.file) {
      console.error('No file uploaded in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = `${BASE_URL}/Uploads/ads/${req.file.filename}`;
    console.log('Image uploaded:', imageUrl);
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Error uploading ad image:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Create or update ads
router.post('/', async (req, res) => {
  try {
    console.log('Received ad update request:', JSON.stringify(req.body, null, 2));
    const { adImages, adLinks, visibility } = req.body;

    if (!adImages || !adLinks || !visibility) {
      console.error('Missing required fields:', { adImages, adLinks, visibility });
      return res.status(400).json({ message: 'adImages, adLinks, and visibility are required' });
    }

    if (JSON.stringify(req.body).length > 1024 * 1024) {
      console.error('Payload too large');
      return res.status(400).json({ message: 'Payload too large' });
    }

    for (const adType of Object.keys(adImages)) {
      if (!validAdTypes.includes(adType)) {
        console.error('Invalid ad type in adImages:', adType);
        return res.status(400).json({ message: `Invalid ad type in adImages: ${adType}` });
      }
      if (adImages[adType] && (typeof adImages[adType] !== 'string' || !adImages[adType].trim())) {
        console.error('Invalid image path for ad:', adType);
        return res.status(400).json({ message: `Invalid image path for ad: ${adType}` });
      }
    }

    for (const adType of Object.keys(adLinks)) {
      if (!validAdTypes.includes(adType)) {
        console.error('Invalid ad type in adLinks:', adType);
        return res.status(400).json({ message: `Invalid ad type in adným4Links: ${adType}` });
      }
      if (adLinks[adType] && typeof adLinks[adType] !== 'string') {
        console.error('Invalid link for ad:', adType);
        return res.status(400).json({ message: `Invalid link for ad: ${adType}` });
      }
    }

    for (const adType of Object.keys(visibility)) {
      if (!validAdTypes.includes(adType)) {
        console.error('Invalid ad type in visibility:', adType);
        return res.status(400).json({ message: `Invalid ad type in visibility: ${adType}` });
      }
      if (typeof visibility[adType] !== 'boolean') {
        console.error('Invalid visibility value for ad:', adType);
        return res.status(400).json({ message: `Invalid visibility value for ad: ${adType}` });
      }
    }

    const cleanedAdImages = {};
    const cleanedAdLinks = {};
    const cleanedVisibility = {};

    validAdTypes.forEach((adType) => {
      if (adImages[adType]?.trim()) cleanedAdImages[adType] = adImages[adType];
      if (adLinks[adType]?.trim()) cleanedAdLinks[adType] = adLinks[adType];
      if (visibility[adType] !== undefined) cleanedVisibility[adType] = visibility[adType];
    });

    const update = {
      adImages: cleanedAdImages,
      adLinks: cleanedAdLinks,
      visibility: cleanedVisibility,
    };

    console.log('Cleaned update payload:', JSON.stringify(update, null, 2));

    // Check MongoDB connection with retry
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected, attempting to reconnect...');
      try {
        await mongoose.connect('mongodb://localhost:27017/nnrnhub', {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
        });
        console.log('Reconnected to MongoDB');
      } catch (reconnectError) {
        console.error('Reconnection failed:', reconnectError);
        return res.status(500).json({ message: 'Database not connected', error: reconnectError.message });
      }
    }

    let ad;
    try {
      ad = await Ad.findOneAndUpdate(
        {},
        { $set: update },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean();
    } catch (updateError) {
      console.error('Error during findOneAndUpdate:', updateError);
      return res.status(500).json({ message: `Failed to update ad document: ${updateError.message}` });
    }

    if (!ad) {
      console.error('No ad document returned after update');
      return res.status(500).json({ message: 'Failed to create or update ad document' });
    }

    console.log('Ad saved to MongoDB:', JSON.stringify(ad, null, 2));

    const responseData = {
      adImages: ad.adImages || {},
      adLinks: ad.adLinks || {},
      visibility: ad.visibility || {},
    };

    validAdTypes.forEach((key) => {
      responseData[`${key}AdVisible`] = Boolean(responseData.visibility[key]);
    });

    console.log('Sending ad response:', JSON.stringify(responseData, null, 2));
    res.json({
      message: 'Ads saved successfully',
      ad: responseData,
    });
  } catch (error) {
    console.error('Error saving ads:', error);
    res.status(500).json({ message: error.message || 'Server error when saving ads' });
  }
});

// Ad inquiries routes
router.post('/inquiries', async (req, res) => {
  try {
    console.log('Received ad inquiry:', req.body);
    const { name, email, company, adType, message } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name is required and must be at least 2 characters' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Valid email address is required' });
    }
    if (!adType || !['Banner', 'Sponsored Post', 'Newsletter', 'Other'].includes(adType)) {
      return res.status(400).json({ message: 'Valid advertisement type is required' });
    }

    const inquiry = new AdInquiry({
      name: name.trim(),
      email: email.trim(),
      company: company ? company.trim() : '',
      adType,
      message: message ? message.trim() : '',
    });

    await inquiry.save();
    console.log('Saved ad inquiry:', inquiry);
    res.status(201).json({ message: 'Inquiry submitted successfully' });
  } catch (error) {
    console.error('Error saving ad inquiry:', error);
    res.status(500).json({ message: error.message || 'Server error when submitting inquiry' });
  }
});

router.get('/inquiries', authAdminMiddleware, async (req, res) => {
  try {
    console.log('Fetching all ad inquiries');
    const inquiries = await AdInquiry.find().sort({ createdAt: -1 });
    console.log('Retrieved inquiries:', inquiries);
    res.status(200).json(inquiries);
  } catch (error) {
    console.error('Error fetching ad inquiries:', error);
    res.status(500).json({ message: error.message || 'Server error when fetching inquiries' });
  }
});

module.exports = router;