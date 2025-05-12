const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Event title is required'], trim: true },
  image: { type: String, trim: true },
  date: { type: Date, required: [true, 'Event date is required'] },
  location: { type: String, required: [true, 'Event location is required'], trim: true },
  description: { type: String, required: [true, 'Event description is required'], trim: true },
  isInHouse: { type: Boolean, default: true },
  organizerLink: { type: String, trim: true },
  timeZone: { type: String, default: 'Asia/Kathmandu', trim: true },
  registeredUsers: [
    {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other'],
      },
      age: { type: Number, required: true, min: 1, max: 120 },
      registeredAt: { type: Date, default: Date.now },
      referenceId: {
        type: String,
        default: () => `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Event', eventSchema);