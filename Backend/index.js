const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');

// Increase EventEmitter max listeners
const EventEmitter = require('events');
EventEmitter.defaultMaxListeners = 15;

// Routes
const subscriberRoutes = require('./Src/routes/subscriber.routes');
const blogRoutes = require('./Src/routes/blog.routes');
const commentRoutes = require('./Src/routes/comment.routes');
const authRoutes = require('./Src/routes/auth.user.route');
const adsRoutes = require('./Src/routes/ad.routes');
const coverRoutes = require('./Src/routes/coverRoutes');
const callRoutes = require('./Src/routes/call.routes');
const analyticsRoutes = require('./Src/routes/analyticsRoutes');

const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Ensure uploads directory exists
const uploadsPath = path.join(__dirname, 'Src', 'Uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(UploadsPath, { recursive: true });
  console.log(`Created directory: ${uploadsPath}`);
}

// Serve static files from Uploads
app.use('/Uploads', express.static(uploadsPath));
console.log(`Serving /Uploads from: ${uploadsPath}`);

// Serve React frontend static files
const frontendPath = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(frontendPath));
console.log(`Serving frontend from: ${frontendPath}`);

// Debug route
app.get('/api/test', (req, res) => {
  res.json({ status: 'API is working' });
});

// Use routes
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/cover', coverRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/analytics', analyticsRoutes);

// Catch-all route for React client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// MongoDB Connection
async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('MongoDB Connected successfully');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  }
}

// Graceful shutdown
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
main().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`App URL: http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('Startup Error:', err);
  process.exit(1);
});