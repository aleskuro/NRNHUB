const mongoose = require('mongoose');

const adInquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
  },
  company: {
    type: String,
    trim: true,
    maxlength: 100,
    default: '',
  },
  adType: {
    type: String,
    required: true,
    enum: ['Banner', 'Sponsored Post', 'Newsletter', 'Other'],
  },
  message: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const AdInquiry = mongoose.model('AdInquiry', adInquirySchema);

module.exports = AdInquiry;