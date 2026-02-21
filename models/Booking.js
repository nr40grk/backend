const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  artist: { type: String, required: true, trim: true },
  service: { type: String, required: true, trim: true },
  message: { type: String, trim: true, default: '' },
  attachments: [{
    url: String,
    publicId: String,
    originalName: String,
  }],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  notes: { type: String, default: '' }, // internal admin notes
  read: { type: Boolean, default: false },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Booking', bookingSchema);