const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  content: { type: Object, required: true }, // EditorJS or Quill content
  conclusion: { type: Object }, // Optional field for conclusion (Quill content)
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

// Pre-save hook to validate conclusion field
BlogSchema.pre('save', function (next) {
  // If conclusion is null or undefined, it's valid (optional field)
  if (this.conclusion == null) {
    return next();
  }

  // If conclusion exists, validate its structure
  if (
    !this.conclusion.type ||
    this.conclusion.type !== 'quill' ||
    !this.conclusion.data ||
    typeof this.conclusion.data !== 'string' ||
    this.conclusion.data.trim() === ''
  ) {
    return next(
      new Error(
        'Invalid conclusion format: Must be null or an object with type "quill" and non-empty data string'
      )
    );
  }

  next();
});

const Blog = mongoose.model('Blog', BlogSchema);

module.exports = Blog;