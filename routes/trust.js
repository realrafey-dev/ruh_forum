const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const types = /jpeg|jpg|png|gif|webp/;
    cb(null, types.test(path.extname(file.originalname).toLowerCase()));
  }
});

router.get('/', async (req, res) => {
  try {
    const [trusts] = await pool.query(
      `SELECT t.*, u.full_name as creator_name
       FROM trusts t
       JOIN users u ON t.user_id = u.id
       WHERE t.is_active = TRUE
       ORDER BY t.created_at DESC`
    );

    let userTrusts = [];
    if (req.session.user) {
      [userTrusts] = await pool.query(
        'SELECT * FROM trusts WHERE user_id = ? ORDER BY created_at DESC',
        [req.session.user.id]
      );
    }

    res.render('trusts', {
      title: 'Trusts - RUH Forum',
      user: req.session.user || null,
      trusts,
      userTrusts
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

router.get('/create', isAuthenticated, (req, res) => {
  res.render('create-trust', {
    title: 'Create Trust - RUH Forum',
    user: req.session.user
  });
});

router.post('/create', isAuthenticated, upload.single('photo'), async (req, res) => {
  try {
    const { title, description, relation, target_amount } = req.body;
    if (!title || !relation) {
      req.flash('error', 'Title and relation are required');
      return res.redirect('/trusts/create');
    }

    const photo = req.file ? '/uploads/' + req.file.filename : null;
    await pool.query(
      `INSERT INTO trusts (user_id, title, description, relation, photo, target_amount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.session.user.id, title, description, relation, photo, target_amount || 0]
    );

    req.flash('success', 'Trust created successfully! May Allah accept your efforts.');
    res.redirect('/trusts');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to create trust');
    res.redirect('/trusts/create');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [trusts] = await pool.query(
      `SELECT t.*, u.full_name as creator_name
       FROM trusts t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = ?`,
      [req.params.id]
    );

    if (trusts.length === 0) {
      req.flash('error', 'Trust not found');
      return res.redirect('/trusts');
    }

    const [donations] = await pool.query(
      `SELECT name, amount, message, is_anonymous, created_at
       FROM donations
       WHERE trust_id = ? AND status = 'verified'
       ORDER BY created_at DESC`,
      [req.params.id]
    );

    res.render('trust-detail', {
      title: trusts[0].title + ' - RUH Forum',
      user: req.session.user || null,
      trust: trusts[0],
      donations
    });
  } catch (err) {
    console.error(err);
    res.redirect('/trusts');
  }
});

router.post('/:id/donate', upload.single('screenshot'), async (req, res) => {
  try {
    const { name, email, phone, amount, message, is_anonymous } = req.body;
    if (!name || !email || !amount || amount <= 0) {
      req.flash('error', 'Please fill all required fields');
      return res.redirect(`/trusts/${req.params.id}`);
    }

    const screenshot = req.file ? '/uploads/' + req.file.filename : null;
    const userId = req.session.user ? req.session.user.id : null;

    const [result] = await pool.query(
      `INSERT INTO donations (user_id, trust_id, type, name, email, phone, amount, screenshot, message, is_anonymous)
       VALUES (?, ?, 'trust', ?, ?, ?, ?, ?, ?, ?)`,
      [userId, req.params.id, name, email, phone, amount, screenshot, message, is_anonymous === 'on']
    );

    await pool.query(
      'UPDATE trusts SET raised_amount = raised_amount + ? WHERE id = ?',
      [amount, req.params.id]
    );

    req.flash('success', 'Donation to trust submitted! May Allah bless you.');
    res.redirect('/donate/history');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Donation failed');
    res.redirect(`/trusts/${req.params.id}`);
  }
});

module.exports = router;
