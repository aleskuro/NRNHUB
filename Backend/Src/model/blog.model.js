const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  content: { type: Object, required: true }, // EditorJS or Quill content
  conclusion: { type: Object }, // New field for conclusion (Quill content)
  coverImg: String,
  category: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: Number,
  createdAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 }, // Track total views
  readTime: { type: Number, default: 0 }, // Total read time in seconds
  readCount: { type: Number, default: 0 }, // Number of times read to calculate avg read time
  likes: { type: Number, default: 0 }, // Track likes
  shares: { type: Number, default: 0 }, // Track shares
  commentCount: { type: Number, default: 0 }, // Track number of comments
});

const Blog = mongoose.model('Blog', BlogSchema);

module.exports = Blog;