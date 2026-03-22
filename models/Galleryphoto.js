const mongoose = require('mongoose');

const galleryPhotoSchema = new mongoose.Schema({
  url:       { type: String, required: true },
  publicId:  { type: String, required: true },
  type:      { type: String, enum: ['tattoo', 'studio'], required: true },
  caption:   { type: String, default: '' },
  order:     { type: Number, default: 0 },
  active:    { type: Boolean, default: true },
  featured:  { type: Boolean, default: false }, // used to pin the About Us image
}, { timestamps: true });

module.exports = mongoose.model('GalleryPhoto', galleryPhotoSchema);