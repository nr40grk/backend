const express = require('express');
const router  = express.Router();
const Event   = require('../models/Event');
const auth    = require('../middleware/auth');
const {
  uploadGalleryPhoto,      // reusing — same multer config (image, 10MB)
  processGalleryPhoto,     // reusing — uploads buffer to Cloudinary, returns { secure_url, public_id }
  deleteFromCloudinary,    // reusing — deletes by publicId
} = require('../utils/cloudinary');

// ─── PUBLIC: GET all active events sorted by date ───
// GET /api/events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ active: true }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ADMIN: GET all events (including hidden) ───
// GET /api/events/all
router.get('/all', auth, async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUBLIC: GET single event ───
// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ADMIN: Create event ───
// POST /api/events
router.post('/', auth, (req, res) => {
  uploadGalleryPhoto(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const { title, date, description, active, order } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: 'Title and date are required' });
    }

    try {
      const payload = {
        title:       title.trim(),
        date:        new Date(date),
        description: (description || '').trim(),
        active:      active !== 'false',
        order:       parseInt(order) || 0,
      };

      if (req.file) {
        const result = await processGalleryPhoto(req.file, 'events');
        payload.imageUrl = result.secure_url;
        payload.publicId = result.public_id;
      }

      const event = await Event.create(payload);
      res.status(201).json(event);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

// ─── ADMIN: Update event ───
// PUT /api/events/:id
router.put('/:id', auth, (req, res) => {
  uploadGalleryPhoto(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    try {
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ error: 'Event not found' });

      const { title, date, description, active, order } = req.body;

      if (title       !== undefined) event.title       = title.trim();
      if (date        !== undefined) event.date         = new Date(date);
      if (description !== undefined) event.description = description.trim();
      if (active      !== undefined) event.active       = active !== 'false';
      if (order       !== undefined) event.order        = parseInt(order) || 0;

      // Replace image if a new file is uploaded
      if (req.file) {
        if (event.publicId) {
          await deleteFromCloudinary(event.publicId).catch(() => {});
        }
        const result = await processGalleryPhoto(req.file, 'events');
        event.imageUrl = result.secure_url;
        event.publicId = result.public_id;
      }

      await event.save();
      res.json(event);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

// ─── ADMIN: Delete event ───
// DELETE /api/events/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.publicId) {
      await deleteFromCloudinary(event.publicId).catch(() => {});
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;