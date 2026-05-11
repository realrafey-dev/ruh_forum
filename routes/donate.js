const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');
const { sendDonationReceipt } = require('../utils/email');

const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const types = /jpeg|jpg|png|gif|webp/;
    const ext = types.test(path.extname(file.originalname).toLowerCase());
    const mime = types.test(file.mimetype);
    cb(null, ext && mime);
  }
});

router.get('/', (req, res) => {
  res.render('donate', {
    title: 'Donate - RUH Forum',
    user: req.session.user || null
  });
});

router.post('/', upload.single('screenshot'), async (req, res) => {
  try {
    const { name, email, phone, amount, message, is_anonymous, zakat } = req.body;
    if (!name || !email || !amount || amount <= 0) {
      req.flash('error', 'Please fill all required fields');
      return res.redirect('/donate');
    }

    const screenshot = req.file ? '/uploads/' + req.file.filename : null;
    const userId = req.session.user ? req.session.user.id : null;

    const [result] = await pool.query(
      `INSERT INTO donations (user_id, type, name, email, phone, amount, screenshot, message, is_anonymous, zakat)
       VALUES (?, 'direct', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, email, phone, amount, screenshot, message, is_anonymous === 'on', zakat === 'on']
    );

    await sendDonationReceipt(email, name, amount, 'Direct Donation');

    req.flash('success', 'Donation submitted! Our team will verify it soon.');
    res.redirect('/donate/history');
  } catch (err) {
    console.error('Donation error:', err);
    req.flash('error', 'Donation failed. Please try again.');
    res.redirect('/donate');
  }
});

router.get('/history', async (req, res) => {
  try {
    let donations = [];
    if (req.session.user) {
      [donations] = await pool.query(
        `SELECT d.*, t.title as trust_title
         FROM donations d
         LEFT JOIN trusts t ON d.trust_id = t.id
         WHERE d.user_id = ? OR d.email = ?
         ORDER BY d.created_at DESC`,
        [req.session.user.id, req.session.user.email]
      );
    }

    res.render('donation-history', {
      title: 'Donation History - RUH Forum',
      user: req.session.user || null,
      donations
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

module.exports = router;
