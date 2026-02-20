// backend/server.js
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

// ===== ROUTES =====
const authRoutes = require('./Src/routes/auth.user.route');
const callRoutes = require('./Src/routes/call.routes');
const eventRoutes = require('./Src/routes/event.routes');
const blogRoutes = require('./Src/routes/blog.routes');
const commentRoutes = require('./Src/routes/comment.routes');
const subscriberRoutes = require('./Src/routes/subscriber.routes');
const analyticsRoutes = require('./Src/routes/analyticsRoutes');
const videoRoutes = require('./Src/routes/video.routes');
const coverRoutes = require('./Src/routes/coverRoutes');
const contactRoutes = require('./Src/routes/ContactRoutes');
const adsRoutes = require('./Src/routes/ad.routes');

const PORT = process.env.PORT || 5000;

// ===== UPLOAD PATHS =====
const uploadsPath = path.join(__dirname, 'Src', 'Uploads');
const adsUploadsPath = path.join(uploadsPath, 'ads');

[uploadsPath, adsUploadsPath].forEach(p => {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  console.log('Upload path:', p);
});

// ===== SERVE STATIC FILES =====
app.use('/Uploads', express.static(path.join(__dirname, 'Src', 'Uploads')));

// ===== MULTER: GENERAL UPLOAD =====
const generalStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsPath),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});
const uploadGeneral = multer({ storage: generalStorage, limits: { fileSize: 10 * 1024 * 1024 } });

// ===== MULTER: AD UPLOAD =====
const adStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, adsUploadsPath),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `adImage-${uniqueSuffix}${ext}`);
  },
});
const uploadAd = multer({
  storage: adStorage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid image type'));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ===== MIDDLEWARE =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ===== CORS =====
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://54.161.21.19',
  'http://54.161.21.19:5173',
  'https://nrnhub.com.np',
  'https://www.nrnhub.com.np',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('CORS blocked'));
  },
  credentials: true,
}));

// ===== GENERAL UPLOAD =====
app.post('/api/upload', uploadGeneral.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `/Uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// ===== AD IMAGE UPLOAD (SAVE TO DB + RETURN FULL URL) =====
app.post('/api/ads/upload', uploadAd.single('adImage'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No ad image uploaded' });

    const fileName = req.file.filename;
    const relativePath = `/Uploads/ads/${fileName}`;
    
    // FORCE FULL URL
    const base = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');
    const fullUrl = `${base.startsWith('http') ? base : 'http://' + base}${relativePath}`;

    const { adType } = req.body;
    if (!adType) return res.status(400).json({ error: 'adType is required' });

    const Ad = require('./Src/model/Ad');
    await Ad.findOneAndUpdate(
      {},
      { [`adImages.${adType}`]: relativePath }, // Save relative
      { upsert: true, new: true }
    );

    res.json({ url: fullUrl }); // ← ALWAYS FULL URL
  } catch (err) {
    console.error('Ad upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== TEST =====
app.get('/api/test', (req, res) => res.json({ status: 'OK' }));

// ===== ROUTES =====
app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/cover', coverRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/ads', adsRoutes);

// ===== ERROR & 404 =====
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err instanceof multer.MulterError ? 400 : 500).json({ error: err.message });
});

app.use('*', (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ===== START =====
async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('MongoDB Connected');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Ad Upload: POST /api/ads/upload (adImage + adType)`);
    });
  } catch (err) {
    console.error('DB Error:', err.message);
    process.exit(1);
  }
}

start();

module.exports = app;