const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true }, // Cloudinary public ID for deletion
  caption: { type: String, default: '' },
}, { _id: true });

const artistSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: {
    gr: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true },
  },
  bio: {
    gr: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true },
  },
  profilePhoto: {
  url: { type: String, default: '' },
  publicId: { type: String, default: '' },
},
  photos: { type: [photoSchema], default: [] },
  order: { type: Number, default: 0 }, // for custom display ordering
  active: { type: Boolean, default: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Artist', artistSchema);