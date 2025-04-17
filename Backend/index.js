const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');

const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  })
);

// Serve static files
const adsStaticPath = path.join(__dirname, 'Uploads', 'ads');
console.log(`Serving /Uploads/ads from: ${adsStaticPath}`);
app.use('/Uploads/ads', express.static(adsStaticPath));
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));

// Routes
const blogRoutes = require('./Src/routes/blog.routes');
const commentRoutes = require('./Src/routes/comment.routes');
const authRoutes = require('./Src/routes/auth.user.route');
const adsRoutes = require('/Users/user/Desktop/nnrnhub/Backend/Src/routes/ad.routes.js')

app.use('/api/auth', authRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/ads', adsRoutes);

// MongoDB Connection
async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
}

main()
  .then(() => console.log('MongoDB Connected successfully'))
  .catch((err) => console.log('MongoDB Connection Error:', err));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});