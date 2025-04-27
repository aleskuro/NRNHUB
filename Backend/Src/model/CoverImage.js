const mongoose = require('mongoose');

const coverImageSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CoverImage = mongoose.model('CoverImage', coverImageSchema);

module.exports = CoverImage;