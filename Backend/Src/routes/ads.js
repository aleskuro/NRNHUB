// backend/routes/ads.js
const express = require('express');
const router = express.Router();
const {
  getAds,
  getInquiries,
  submitInquiry,
} = require('../controllers/adsController');
const auth = require('../middleware/auth'); // Remove if no login

// Public
router.get('/', getAds);                    // GET /api/ads
router.post('/inquiry', submitInquiry);     // POST /api/ads/inquiry

// Admin (optional auth)
router.get('/inquiries', auth, getInquiries); // GET /api/ads/inquiries

module.exports = router;