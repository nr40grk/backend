const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');
const { sendContactNotification, sendContactReply } = require('../utils/email');

// POST /api/contact — public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const contact = new Contact({ name, email, phone, message });
    await contact.save();

    Promise.all([
      sendContactNotification(contact),
      sendContactReply(contact),
    ]).catch(err => console.error('Email send error:', err.message));

    res.status(201).json({ success: true, message: 'Message received' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/contact — admin
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Contact.countDocuments();
    res.json({ contacts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/contact/:id — admin, mark read/unread
router.patch('/:id', auth, async (req, res) => {
  try {
    const { read } = req.body;
    const contact = await Contact.findByIdAndUpdate(req.params.id, { read }, { new: true });
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/contact/:id — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;