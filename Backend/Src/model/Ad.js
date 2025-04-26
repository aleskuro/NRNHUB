const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  adImages: {
    type: Map,
    of: String,
    default: {},
  },
  adLinks: {
    type: Map,
    of: String,
    default: {},
  },
  visibility: {
    type: Map,
    of: Boolean,
    default: {},
  },
}, {
  timestamps: true,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true },
});

// Remove Mongoose metadata before saving
adSchema.pre('save', function (next) {
  const doc = this;
  if (doc.adImages) {
    for (const key of doc.adImages.keys()) {
      if (key.startsWith('$')) doc.adImages.delete(key);
    }
  }
  if (doc.adLinks) {
    for (const key of doc.adLinks.keys()) {
      if (key.startsWith('$')) doc.adLinks.delete(key);
    }
  }
  if (doc.visibility) {
    for (const key of doc.visibility.keys()) {
      if (key.startsWith('$')) doc.visibility.delete(key);
    }
  }
  next();
});

const Ad = mongoose.model('Ad', adSchema);

module.exports = Ad;