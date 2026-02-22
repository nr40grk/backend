const express = require('express');
const router = express.Router();
const Artist = require('../models/Artist');
const auth = require('../middleware/auth');
const { uploadArtistPhoto, processArtistPhoto, deleteFromCloudinary } = require('../utils/cloudinary');

// GET /api/artists — public
router.get('/', async (req, res) => {
  try {
    const artists = await Artist.find({ active: true }).sort({ order: 1, createdAt: 1 });
    res.json(artists);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/artists/all — admin
router.get('/all', auth, async (req, res) => {
  try {
    const artists = await Artist.find().sort({ order: 1, createdAt: 1 });
    res.json(artists);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/artists — admin
router.post('/', auth, async (req, res) => {
  try {
    const { name, role, bio, order, active } = req.body;
    if (!name || !role?.gr || !role?.en || !bio?.gr || !bio?.en)
      return res.status(400).json({ error: 'Missing required fields' });
    const artist = new Artist({ name, role, bio, order: order || 0, active: active !== false });
    await artist.save();
    res.status(201).json(artist);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/artists/:id — admin
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, role, bio, order, active } = req.body;
    const artist = await Artist.findByIdAndUpdate(
      req.params.id, { name, role, bio, order, active }, { new: true, runValidators: true }
    );
    if (!artist) return res.status(404).json({ error: 'Artist not found' });
    res.json(artist);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/artists/:id — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ error: 'Artist not found' });
    await Promise.all(artist.photos.map(p => deleteFromCloudinary(p.publicId)));
    await artist.deleteOne();
    res.json({ message: 'Artist deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/artists/:id/photos — admin
router.post('/:id/photos', auth, (req, res) => {
  uploadArtistPhoto(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    try {
      const artist = await Artist.findById(req.params.id);
      if (!artist) return res.status(404).json({ error: 'Artist not found' });

      const result = await processArtistPhoto(req.file);
      artist.photos.push({
        url: result.secure_url,
        publicId: result.public_id,
        caption: req.body.caption || '',
      });
      await artist.save();
      res.status(201).json(artist);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
});

// DELETE /api/artists/:id/photos/:photoId — admin
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
  } catch (err) { res.status(500).json({ error: err.message }); }
});
// GET /api/artists/:id — public
router.get('/:id', async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist || !artist.active) return res.status(404).json({ error: 'Artist not found' });
    res.json(artist);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
// POST /api/artists/:id/profile-photo — admin
router.post('/:id/profile-photo', auth, (req, res) => {
  uploadArtistPhoto(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    try {
      const artist = await Artist.findById(req.params.id);
      if (!artist) return res.status(404).json({ error: 'Artist not found' });

      // Delete old profile photo from Cloudinary if exists
      if (artist.profilePhoto?.publicId) {
        await deleteFromCloudinary(artist.profilePhoto.publicId);
      }

      const result = await processArtistPhoto(req.file);
      artist.profilePhoto = { url: result.secure_url, publicId: result.public_id };
      await artist.save();
      res.json(artist);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
});
module.exports = router;