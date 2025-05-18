const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const authRoutes = require('./Src/routes/auth.user.route');
const callRoutes = require('./Src/routes/call.routes');
const eventRoutes = require('./Src/routes/event.routes');
const blogRoutes = require('./Src/routes/blog.routes');
const commentRoutes = require('./Src/routes/comment.routes');
const subscriberRoutes = require('./Src/routes/subscriber.routes');
const analyticsRoutes = require('./Src/routes/analyticsRoutes');
const videoRoutes = require('./Src/routes/video.routes');
const coverRoutes = require('./Src/routes/coverRoutes');
const adRoutes = require('./Src/routes/ad.routes');
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// CORS configuration
app.use(
  cors({
    origin: [
      'http://localhost:5173', // Local development
      'http://172.31.4.185:5173', // Additional local IP
      'http://65.0.131.189:5173', // Production frontend
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Required for cookies/auth tokens
  })
);

// Ensure uploads directory exists
const uploadsPath = path.join(__dirname, 'Src', 'Uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(UploadsPath, { recursive: true });
  console.log(`Created directory: ${uploadsPath}`);
}

// Serve static files
app.use('/Uploads', express.static(uploadsPath));
console.log(`Serving /Uploads from: ${uploadsPath}`);

// Debug route
app.get('/api/test', (req, res) => {
  res.json({ status: 'API is working' });
});

// Use routes
app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/cover', coverRoutes);
app.use('/api/ads', adRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('MongoDB Connected successfully');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during MongoDB connection closure:', err);
    process.exit(1);
  }
});

main().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`API URL: http://65.0.131.189:${port}`); // Updated for production
  });
}).catch((err) => {
  console.error('Startup Error:', err);
  process.exit(1);
});