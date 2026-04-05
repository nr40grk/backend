const express      = require('express');
const router       = express.Router();
const Testimonial  = require('../models/Testimonial');
const authMiddleware = require('../middleware/auth');

// Public — get testimonials for an artist
router.get('/', async (req, res) => {
  try {
    const filter = req.query.artistId ? { artistId: req.query.artistId } : {};
    const items = await Testimonial.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin — create
router.post('/', authMiddleware, async (req, res) => {
  try {
    const t = await Testimonial.create(req.body);
    res.json(t);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin — update
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(t);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin — delete
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ deleted: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
