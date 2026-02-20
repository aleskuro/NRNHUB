// Src/routes/ad.routes.js
const express = require('express');
const router = express.Router();
const Ad = require('../model/Ad');
const AdInquiry = require('../model/AdInquiry');

const validAdTypes = [
  'mobile','right1','right2','right3','right4','right5',
  'left1','left2','left3','left4','left5','bottom','navbar','hero',
  'blogsFirst','blogsSecond','blogsThird','blogsFourth','blogsFifth',
  'blogsHome1','blogsHome2','blogsHome3','economyAds1','economyAds2',
  'lifestyle1','lifestyle2'
];

router.get('/', async (req, res) => {
  try {
    const ad = await Ad.findOne().lean();
    res.json(ad || { adImages: {}, adLinks: {}, visibility: {} });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { adImages, adLinks, visibility } = req.body;
    const cleaned = { adImages: {}, adLinks: {}, visibility: {} };

    validAdTypes.forEach((t) => {
      if (adImages[t]?.trim()) cleaned.adImages[t] = adImages[t];
      if (adLinks[t]?.trim()) cleaned.adLinks[t] = adLinks[t];
      if (typeof visibility[t] === 'boolean') cleaned.visibility[t] = visibility[t];
    });

    const updated = await Ad.findOneAndUpdate({}, cleaned, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    res.json({ message: 'Saved', ad: updated });
  } catch (err) {
    res.status(500).json({ message: 'Save failed' });
  }
});

// Get all ad inquiries (admin-only)
router.get('/inquiries', async (req, res) => {
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