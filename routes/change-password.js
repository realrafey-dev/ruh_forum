const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, (req, res) => {
  res.render('change-password', {
    title: 'Change Password - RUH Forum',
    user: req.session.user
  });
});

router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password || !confirm_password) {
      req.flash('error', 'All fields are required');
      return res.redirect('/change-password');
    }

    if (new_password.length < 6) {
      req.flash('error', 'New password must be at least 6 characters');
      return res.redirect('/change-password');
    }

    if (new_password !== confirm_password) {
      req.flash('error', 'New passwords do not match');
      return res.redirect('/change-password');
    }

    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.session.user.id]);
    if (users.length === 0) {
      req.flash('error', 'User not found');
      return res.redirect('/change-password');
    }

    const valid = await bcrypt.compare(current_password, users[0].password);
    if (!valid) {
      req.flash('error', 'Current password is incorrect');
      return res.redirect('/change-password');
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.session.user.id]);

    req.flash('success', 'Password changed successfully!');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to change password');
    res.redirect('/change-password');
  }
});

module.exports = router;
