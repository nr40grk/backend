const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');
const { uploadBookingFiles, processBookingFile } = require('../utils/cloudinary');
const { sendBookingNotification, sendBookingConfirmation } = require('../utils/email');

// POST /api/booking — public
router.post('/', (req, res) => {
  uploadBookingFiles(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    try {
      const { fullName, phone, email, artist, service, message } = req.body;
      if (!fullName || !phone || !email || !artist || !service)
        return res.status(400).json({ error: 'Missing required fields' });

      // Upload files to Cloudinary
      const attachments = [];
      for (const file of (req.files || [])) {
        const result = await processBookingFile(file);
        attachments.push({
          url: result.secure_url,
          publicId: result.public_id,
          originalName: file.originalname,
        });
      }

      const booking = new Booking({ fullName, phone, email, artist, service, message, attachments });
      await booking.save();

      Promise.all([
        sendBookingNotification(booking),
        sendBookingConfirmation(booking),
      ]).catch(err => console.error('Email error:', err.message));

      res.status(201).json({ success: true, message: 'Booking received' });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
});

// GET /api/booking — admin
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const bookings = await Booking.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit));
    const total = await Booking.countDocuments(filter);
    res.json({ bookings, total, page: Number(page), pages: Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/booking/:id — admin
router.patch('/:id', auth, async (req, res) => {
  try {
    const { status, notes, read } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { ...(status && { status }), ...(notes !== undefined && { notes }), ...(read !== undefined && { read }) },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/booking/:id — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;