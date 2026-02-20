// backend/controllers/adsController.js
const Ad = require('../models/Ad');           // Your existing Ad model
const AdInquiry = require('../models/AdInquiry'); // New inquiry model
const { normalizeAdImage } = require('../../utilis/normalizeAdImage'); // Fixed path
const API_URL = process.env.API_URL || 'http://localhost:5000';

// GET /api/ads → Return ads with full image URLs
exports.getAds = async (req, res) => {
  try {
    let adDoc = await Ad.findOne();
    if (!adDoc) adDoc = new Ad();

    const payload = { adImages: {}, adLinks: {}, visibility: {} };

    adDoc.adImages.forEach((path, key) => {
      payload.adImages[key] = normalizeAdImage(path, API_URL);
    });
    adDoc.adLinks.forEach((link, key) => {
      payload.adLinks[key] = link;
    });
    adDoc.visibility.forEach((bool, key) => {
      payload.visibility[key] = bool;
    });

    res.json(payload);
  } catch (err) {
    console.error('GET /ads error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/ads/inquiries → Admin: list all inquiries
exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await AdInquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    console.error('GET /inquiries error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/ads/inquiry → Public: submit new inquiry
exports.submitInquiry = async (req, res) => {
  try {
    const { name, email, company, adType, message } = req.body;

    if (!name || !email || !adType) {
      return res.status(400).json({ error: 'Name, email, and ad type are required' });
    }

    const inquiry = new AdInquiry({
      name: name.trim(),
      email: email.trim(),
      company: company?.trim() || '',
      adType,
      message: message?.trim() || '',
    });

    await inquiry.save();
    res.status(201).json({ message: 'Inquiry submitted successfully' });
  } catch (err) {
    console.error('POST /inquiry error:', err);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
};