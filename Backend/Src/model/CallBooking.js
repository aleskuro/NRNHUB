const mongoose = require('mongoose');

const callBookingSchema = new mongoose.Schema({
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
  phone: {
    type: String,
    trim: true,
    maxlength: 20,
    default: '',
  },
  dateTime: {
    type: Date,
    required: true,
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

const CallBooking = mongoose.model('CallBooking', callBookingSchema);

module.exports = CallBooking;