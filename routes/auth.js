const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { isAuthenticated, isGuest } = require('../middleware/auth');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/email');

router.get('/register', isGuest, (req, res) => {
  res.render('register', { title: 'Register - RUH Forum' });
});

router.post('/register', isGuest, async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;
    if (!full_name || !email || !password) {
      req.flash('error', 'Name, email and password are required');
      return res.redirect('/register');
    }
    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters');
      return res.redirect('/register');
    }

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?', [email]
    );
    if (existing.length > 0) {
      req.flash('error', 'Email already registered');
      return res.redirect('/register');
    }

    const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, full_name, phone) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, full_name, phone || null]
    );

    req.session.user = {
      id: result.insertId,
      username,
      email,
      full_name
    };

    await sendWelcomeEmail(email, username, password);

    req.flash('success', 'Welcome to RUH Forum! Your account has been created.');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Registration error:', err);
    req.flash('error', 'Registration failed. Please try again.');
    res.redirect('/register');
  }
});

router.get('/login', isGuest, (req, res) => {
  res.render('login', { title: 'Login - RUH Forum' });
});

router.post('/login', isGuest, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      req.flash('error', 'Username and password required');
      return res.redirect('/login');
    }

    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      req.flash('error', 'Invalid credentials');
      return res.redirect('/login');
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      req.flash('error', 'Invalid credentials');
      return res.redirect('/login');
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name
    };

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    req.flash('error', 'Login failed');
    res.redirect('/login');
  }
});

router.get('/logout', isAuthenticated, (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

router.get('/forgot-password', isGuest, (req, res) => {
  res.render('forgot-password', { title: 'Forgot Password - RUH Forum' });
});

router.post('/forgot-password', isGuest, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      req.flash('error', 'Please enter your email');
      return res.redirect('/forgot-password');
    }

    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      req.flash('info', 'If this email is registered, you will receive a reset link.');
      return res.redirect('/forgot-password');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000);

    await pool.query(
      'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
      [email, token, expiresAt]
    );

    await sendPasswordResetEmail(email, token);

    req.flash('success', 'Reset link sent to your email. Check your inbox/spam.');
    res.redirect('/login');
  } catch (err) {
    console.error('Forgot password error:', err);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/forgot-password');
  }
});

router.get('/reset-password/:token', isGuest, async (req, res) => {
  try {
    const { token } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM password_resets WHERE token = ? AND used = FALSE AND expires_at > NOW()',
      [token]
    );

    if (rows.length === 0) {
      req.flash('error', 'Invalid or expired reset link');
      return res.redirect('/forgot-password');
    }

    res.render('reset-password', {
      title: 'Reset Password - RUH Forum',
      token
    });
  } catch (err) {
    console.error('Reset password page error:', err);
    req.flash('error', 'Something went wrong');
    res.redirect('/forgot-password');
  }
});

router.post('/reset-password/:token', isGuest, async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirm_password } = req.body;

    if (!password || !confirm_password) {
      req.flash('error', 'All fields are required');
      return res.redirect(`/reset-password/${token}`);
    }

    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters');
      return res.redirect(`/reset-password/${token}`);
    }

    if (password !== confirm_password) {
      req.flash('error', 'Passwords do not match');
      return res.redirect(`/reset-password/${token}`);
    }

    const [rows] = await pool.query(
      'SELECT * FROM password_resets WHERE token = ? AND used = FALSE AND expires_at > NOW()',
      [token]
    );

    if (rows.length === 0) {
      req.flash('error', 'Invalid or expired reset link');
      return res.redirect('/forgot-password');
    }

    const reset = rows[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, reset.email]);
    await pool.query('UPDATE password_resets SET used = TRUE WHERE id = ?', [reset.id]);

    req.flash('success', 'Password reset successfully! Login with your new password.');
    res.redirect('/login');
  } catch (err) {
    console.error('Reset password error:', err);
    req.flash('error', 'Failed to reset password');
    res.redirect('/forgot-password');
  }
});

module.exports = router;
