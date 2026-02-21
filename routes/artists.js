const express = require('express');
const router = express.Router();
const Artist = require('../models/Artist');
const auth = require('../middleware/auth');
const { uploadArtistPhoto, deleteFromCloudinary } = require('../utils/cloudinary');

// GET /api/artists — public, returns all active artists
router.get('/', async (req, res) => {
  try {
    const artists = await Artist.find({ active: true }).sort({ order: 1, createdAt: 1 });
    res.json(artists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/artists/all — admin, returns all including inactive
router.get('/all', auth, async (req, res) => {
  try {
    const artists = await Artist.find().sort({ order: 1, createdAt: 1 });
    res.json(artists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/artists — admin, create artist
router.post('/', auth, async (req, res) => {
  try {
    const { name, role, bio, order, active } = req.body;
    if (!name || !role?.gr || !role?.en || !bio?.gr || !bio?.en) {
      return res.status(400).json({ error: 'Missing required fields: name, role (gr/en), bio (gr/en)' });
    }
    const artist = new Artist({ name, role, bio, order: order || 0, active: active !== false });
    await artist.save();
    res.status(201).json(artist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/artists/:id — admin, update artist details
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, role, bio, order, active } = req.body;
    const artist = await Artist.findByIdAndUpdate(
      req.params.id,
      { name, role, bio, order, active },
      { new: true, runValidators: true }
    );
    if (!artist) return res.status(404).json({ error: 'Artist not found' });
    res.json(artist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/artists/:id — admin, delete artist + all their Cloudinary photos
router.delete('/:id', auth, async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ error: 'Artist not found' });

    // Delete all photos from Cloudinary
    await Promise.all(artist.photos.map(p => deleteFromCloudinary(p.publicId)));

    await artist.deleteOne();
    res.json({ message: 'Artist deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/artists/:id/photos — admin, upload a photo
router.post('/:id/photos', auth, (req, res) => {
  uploadArtistPhoto(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    try {
      const artist = await Artist.findById(req.params.id);
      if (!artist) return res.status(404).json({ error: 'Artist not found' });

      const photo = {
        url: req.file.path,
        publicId: req.file.filename,
        caption: req.body.caption || '',
      };
      artist.photos.push(photo);
      await artist.save();
      res.status(201).json(artist);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

// DELETE /api/artists/:id/photos/:photoId — admin, remove a specific photo
router.delete('/:id/photos/:photoId', auth, async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ error: 'Artist not found' });

    const photo = artist.photos.id(req.params.photoId);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    await deleteFromCloudinary(photo.publicId);
    photo.deleteOne();
    await artist.save();
    res.json(artist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;