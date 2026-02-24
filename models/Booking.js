const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  fullName:     { type: String, required: true, trim: true },
  phone:        { type: String, required: true, trim: true },
  email:        { type: String, required: true, trim: true, lowercase: true },
  artist:       { type: String, required: true, trim: true },
  service:      { type: String, required: true, trim: true },
  message:      { type: String, trim: true, default: '' },

  // ─── PIERCING FIELDS ───
  piercingType: { type: String, trim: true, default: '' },
  // e.g. "Tooth Gem", "Ear - Lobe", "Nose - Septum", etc.

  depositRequired: { type: Boolean, default: false },
  depositAmount:   { type: Number, default: 0 },
  // 12 for piercing, 0 for tattoo bookings (tattoo deposit handled separately)

  depositPaid:  { type: Boolean, default: false },
  // Set to true manually in admin dashboard after confirming Stripe payment

  attachments: [{
    url:          String,
    publicId:     String,
    originalName: String,
  }],

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },

  notes: { type: String, default: '' }, // internal admin notes
  read:  { type: Boolean, default: false },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Booking', bookingSchema);