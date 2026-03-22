const express = require('express');
const router = express.Router();
const GalleryPhoto = require('../models/Galleryphoto');
const auth = require('../middleware/auth');
const { uploadGalleryPhoto, processGalleryPhoto, deleteFromCloudinary } = require('../utils/cloudinary');

// ─── PUBLIC: GET all active photos (optionally filtered by type/featured) ───
// GET /api/gallery?type=tattoo|studio
// GET /api/gallery?type=studio&featured=true  → returns only the featured about photo
router.get('/', async (req, res) => {
  try {
    const filter = { active: true };
    if (req.query.type && ['tattoo', 'studio'].includes(req.query.type)) {
      filter.type = req.query.type;
    }
    if (req.query.featured === 'true') {
      filter.featured = true;
    }
    const photos = await GalleryPhoto.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ADMIN: GET all photos (including inactive) ───
// GET /api/gallery/all
router.get('/all', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.type && ['tattoo', 'studio'].includes(req.query.type)) {
      filter.type = req.query.type;
    }
    const photos = await GalleryPhoto.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ADMIN: Upload a photo ───
// POST /api/gallery
router.post('/', auth, (req, res) => {
  uploadGalleryPhoto(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const { type, caption, order } = req.body;
    if (!type || !['tattoo', 'studio'].includes(type)) {
      return res.status(400).json({ error: 'type must be tattoo or studio' });
    }

    try {
      const result = await processGalleryPhoto(req.file, type);
      const photo = await GalleryPhoto.create({
        url: result.secure_url,
        publicId: result.public_id,
        type,
        caption: caption || '',
        order: parseInt(order) || 0,
        active: true,
        featured: false,
      });
      res.status(201).json(photo);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

// ─── ADMIN: Update caption / order / active / featured ───
// PATCH /api/gallery/:id
// When featured:true is set, automatically clears featured on all other studio photos
router.patch('/:id', auth, async (req, res) => {
  try {
    const allowed = {};
    if (req.body.caption  !== undefined) allowed.caption  = req.body.caption;
    if (req.body.order    !== undefined) allowed.order    = parseInt(req.body.order) || 0;
    if (req.body.active   !== undefined) allowed.active   = req.body.active;
    if (req.body.featured !== undefined) allowed.featured = req.body.featured;

    // If setting this photo as featured, unset all other studio photos first
    if (allowed.featured === true) {
      const target = await GalleryPhoto.findById(req.params.id);
      if (!target) return res.status(404).json({ error: 'Photo not found' });
      await GalleryPhoto.updateMany(
        { type: target.type, _id: { $ne: req.params.id } },
        { $set: { featured: false } }
      );
    }

    const photo = await GalleryPhoto.findByIdAndUpdate(req.params.id, allowed, { new: true });
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    res.json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ADMIN: Delete photo (also removes from Cloudinary) ───
// DELETE /api/gallery/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const photo = await GalleryPhoto.findByIdAndDelete(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    if (photo.publicId) {
      await deleteFromCloudinary(photo.publicId).catch(() => {});
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;