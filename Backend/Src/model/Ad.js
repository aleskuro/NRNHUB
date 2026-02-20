// backend/models/ads.js
const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  adImages: {
    type: Map,
    of: String,
    default: () => ({}),
  },
  adLinks: {
    type: Map,
    of: String,
    default: () => ({}),
  },
  visibility: {
    type: Map,
    of: Boolean,
    default: () => ({}),
  },
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true },
});

// Clean internal keys
adSchema.pre('save', function (next) {
  ['adImages', 'adLinks', 'visibility'].forEach(field => {
    if (this[field]) {
      for (const key of this[field].keys()) {
        if (key.startsWith('$')) this[field].delete(key);
      }
    }
  });
  next();
});

module.exports = mongoose.model('Ad', adSchema);