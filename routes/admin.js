const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const Contact = require('../models/Contact');

// The admin has a single account — password stored as bcrypt hash in env
// To generate hash: node -e "const b=require('bcryptjs');b.hash('yourpassword',12).then(console.log)"

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });

    // If ADMIN_PASSWORD_HASH env exists, use it. Otherwise compare plaintext (dev only).
    let valid = false;
    if (process.env.ADMIN_PASSWORD_HASH) {
      valid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    } else {
      valid = password === process.env.ADMIN_PASSWORD;
    }

    if (!valid) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ token, expiresIn: '7d' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stats — dashboard counts
router.get('/stats', auth, async (req, res) => {
  try {
    const [totalBookings, pendingBookings, unreadBookings, totalContacts, unreadContacts] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ read: false }),
      Contact.countDocuments(),
      Contact.countDocuments({ read: false }),
    ]);
    res.json({ totalBookings, pendingBookings, unreadBookings, totalContacts, unreadContacts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/verify — check if token is still valid
router.post('/verify', auth, (req, res) => res.json({ valid: true }));

module.exports = router;