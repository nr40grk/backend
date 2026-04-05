const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  artistId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  clientName: { type: String, required: true },
  text:       { type: String, required: true },
  rating:     { type: Number, min: 1, max: 5, default: 5 },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
