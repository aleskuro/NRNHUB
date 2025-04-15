const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Add this
const bodyParser = require('body-parser')
require('dotenv').config();
const path = require('path'); 


const port = process.env.PORT || 5000;
const mongoose = require('mongoose');

// Middleware
app.use(express.json());
app.use(cookieParser()); // Add this globally
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: '10mb' , extended: true}));
app.use(cors({
    origin: 'http://localhost:5173', // Matches your frontend (Vite default)
    credentials: true, // Allows cookies to be sent
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}));

// Routes
const blogRoutes = require('./Src/routes/blog.routes');
const commentRoutes = require('./Src/routes/comment.routes');
const authRoutes  = require('./Src/routes/auth.user.route');


app.use('/uploads/ads', express.static(path.join(__dirname, 'Uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));
app.use('/api/auth', authRoutes); 
app.use('/api/comments', commentRoutes);
app.use('/api/blogs', blogRoutes);

// MongoDB Connection
async function main() {
    await mongoose.connect(process.env.MONGODB_URL);
}

main()
    .then(() => console.log('MongoDB Connected successfully'))
    .catch((err) => console.log('MongoDB Connection Error:', err));

app.get('/', (req, res) => {
    res.send('Hello World!'); // Cleaned up the message
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});