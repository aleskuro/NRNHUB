const express = require('express');
const router = express.Router();
const Ad = require('../model/Ad');
const AdInquiry = require('../model/AdInquiry');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Middleware for admin authentication
const authAdminMiddleware = (req, res, next) => {
  const isAdmin = true; // Placeholder: Replace with actual JWT verification logic
  if (!isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Configure multer for file uploads
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
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, PNG, GIF, or WebP images are allowed'));
  },
});

// Define valid ad types
const validAdTypes = [
  'mobile', 'right1', 'right2', 'right3', 'right4', 'right5',
  'left1', 'left2', 'left3', 'left4', 'left5', 'bottom',
  'navbar', 'hero', 'blogsFirst', 'blogsSecond', 'blogsThird',
  'blogsFourth', 'blogsFifth', 'blogsHome1', 'blogsHome2', 'blogsHome3'
];

// Test route to verify API is accessible
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
        mobileAdVisible: false,
        right1AdVisible: false,
        right2AdVisible: false,
        right3AdVisible: false,
        right4AdVisible: false,
        right5AdVisible: false,
        left1AdVisible: false,
        left2AdVisible: false,
        left3AdVisible: false,
        left4AdVisible: false,
        left5AdVisible: false,
        bottomAdVisible: false,
        navbarAdVisible: false,
        heroAdVisible: false,
        blogsFirstAdVisible: false,
        blogsSecondAdVisible: false,
        blogsThirdAdVisible: false,
        blogsFourthAdVisible: false,
        blogsFifthAdVisible: false,
        blogsHome1AdVisible: false,
        blogsHome2AdVisible: false,
        blogsHome3AdVisible: false,
      };
      console.log('Sending default ad response:', JSON.stringify(defaults, null, 2));
      return res.json(defaults);
    }

    // Sanitize response
    const response = {
      adImages: ad.adImages || {},
      adLinks: ad.adLinks || {},
      visibility: ad.visibility || {},
    };

    // Remove Mongoose metadata
    Object.keys(response.adImages).forEach(key => {
      if (key.startsWith('$')) delete response.adImages[key];
    });
    Object.keys(response.adLinks).forEach(key => {
      if (key.startsWith('$')) delete response.adLinks[key];
    });
    Object.keys(response.visibility).forEach(key => {
      if (key.startsWith('$')) delete response.visibility[key];
    });

    Object.keys(response.visibility).forEach((key) => {
      response[`${key}AdVisible`] = response.visibility[key];
    });

    validAdTypes.forEach((key) => {
      if (response[`${key}AdVisible`] === undefined) {
        response[`${key}AdVisible`] = false;
      }
    });

    console.log('Sending ad response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({ message: 'Server error when fetching ads', error: error.message });
  }
});

// Upload ad image
router.post('/upload', upload.single('adImage'), (req, res) => {
  console.log('Upload route accessed');

  if (!req.file) {
    console.error('No file uploaded');
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const imagePath = `/Uploads/ads/${req.file.filename}`;
  console.log(`Upload successful, path: ${imagePath}`);

  res.status(200).json({ path: imagePath });
});

// Create or update ads
router.post('/', async (req, res) => {
  try {
    console.log('Received ad update request:', JSON.stringify(req.body, null, 2));

    const { adImages, adLinks, visibility } = req.body;

    // Validate inputs
    if (!adImages || !adLinks || !visibility) {
      console.error('Missing required fields:', { adImages, adLinks, visibility });
      return res.status(400).json({ message: 'adImages, adLinks, and visibility are required' });
    }

    // Validate payload size
    const payloadSize = JSON.stringify(req.body).length;
    if (payloadSize > 1024 * 1024) {
      console.error('Payload too large:', payloadSize);
      return res.status(400).json({ message: 'Payload too large. Please reduce the number of ads.' });
    }

    // Validate ad types and data
    for (const adType of Object.keys(adImages)) {
      if (!validAdTypes.includes(adType)) {
        console.error('Invalid ad type in adImages:', adType);
        return res.status(400).json({ message: `Invalid ad type in adImages: ${adType}` });
      }
      if (adImages[adType] && (typeof adImages[adType] !== 'string' || !adImages[adType].trim())) {
        console.error('Invalid image path for ad:', adType, adImages[adType]);
        return res.status(400).json({ message: `Invalid image path for ad: ${adType}` });
      }
    }

    for (const adType of Object.keys(adLinks)) {
      if (!validAdTypes.includes(adType)) {
        console.error('Invalid ad type in adLinks:', adType);
        return res.status(400).json({ message: `Invalid ad type in adLinks: ${adType}` });
      }
      if (adLinks[adType] && typeof adLinks[adType] !== 'string') {
        console.error('Invalid link for ad:', adType, adLinks[adType]);
        return res.status(400).json({ message: `Invalid link for ad: ${adType}` });
      }
    }

    for (const adType of Object.keys(visibility)) {
      if (!validAdTypes.includes(adType)) {
        console.error('Invalid ad type in visibility:', adType);
        return res.status(400).json({ message: `Invalid ad type in visibility: ${adType}` });
      }
      if (typeof visibility[adType] !== 'boolean') {
        console.error('Invalid visibility value for ad:', adType, visibility[adType]);
        return res.status(400).json({ message: `Invalid visibility value for ad: ${adType}` });
      }
    }

    // Clean payload to remove empty entries
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

    // Ensure MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected');
      return res.status(500).json({ message: 'Database not connected' });
    }

    // Perform update with error handling
    let ad;
    try {
      ad = await Ad.findOneAndUpdate(
        {},
        { $set: update },
        { upsert: true, new: true, setDefaultsOnInsert: true, writeConcern: { w: 'majority' } }
      ).lean();
    } catch (updateError) {
      console.error('Error during findOneAndUpdate:', updateError);
      throw new Error(`Failed to update ad document: ${updateError.message}`);
    }

    if (!ad) {
      console.error('No ad document returned after update');
      throw new Error('Failed to create or update ad document');
    }

    console.log('Ad saved to MongoDB:', JSON.stringify(ad, null, 2));

    // Verify saved ad
    let savedAd;
    try {
      savedAd = await Ad.findOne().lean();
    } catch (findError) {
      console.error('Error verifying saved ad:', findError);
      throw new Error(`Failed to verify saved ad: ${findError.message}`);
    }

    if (!savedAd) {
      console.error('No saved ad document found');
      throw new Error('Saved ad document not found');
    }

    console.log('Verified saved ad:', JSON.stringify(savedAd, null, 2));

    // Sanitize response
    const responseData = {
      adImages: savedAd.adImages || {},
      adLinks: savedAd.adLinks || {},
      visibility: savedAd.visibility || {},
    };

    // Remove Mongoose metadata
    Object.keys(responseData.adImages).forEach(key => {
      if (key.startsWith('$')) delete responseData.adImages[key];
    });
    Object.keys(responseData.adLinks).forEach(key => {
      if (key.startsWith('$')) delete responseData.adLinks[key];
    });
    Object.keys(responseData.visibility).forEach(key => {
      if (key.startsWith('$')) delete responseData.visibility[key];
    });

    Object.keys(responseData.visibility).forEach((key) => {
      responseData[`${key}AdVisible`] = Boolean(responseData.visibility[key]);
    });

    console.log('Sending ad response:', JSON.stringify(responseData, null, 2));
    res.json({
      message: 'Ads saved successfully',
      ad: responseData,
    });
  } catch (error) {
    console.error('Error saving ads:', {
      message: error.message,
      stack: error.stack,
      payload: JSON.stringify(req.body, null, 2),
    });
    res.status(500).json({ message: error.message || 'Server error when saving ads' });
  }
});

// Submit a new ad inquiry
router.post('/inquiries', async (req, res) => {
  try {
    console.log('Received ad inquiry:', req.body);

    const { name, email, company, adType, message } = req.body;

    // Validation
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

// Get all ad inquiries (admin-only)
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