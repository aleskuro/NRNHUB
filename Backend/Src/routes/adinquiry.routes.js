// backend/routes/ads.js
const express = require('express');
const router = express.Router();
const { getInquiries, submitInquiry } = require('../controllers/adsController');
const auth = require('../middleware/auth'); // Optional: if you want admin-only

// GET all inquiries (admin)
router.get('/inquiries', auth, getInquiries); // Remove `auth` if no login

// POST new inquiry (public)
router.post('/inquiry', submitInquiry);

module.exports = router;