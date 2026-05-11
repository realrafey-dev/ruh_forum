const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { isAuthenticated, isGuest } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../utils/email');

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pwd = '';
  for (let i = 0; i < 8; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

router.get('/register', isGuest, (req, res) => {
  res.render('register', { title: 'Register - RUH Forum' });
});

router.post('/register', isGuest, async (req, res) => {
  try {
    const { full_name, email, phone } = req.body;
    if (!full_name || !email) {
      req.flash('error', 'Name and email are required');
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
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (username, email, password, full_name, phone) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, full_name, phone || null]
    );

    const emailSent = await sendWelcomeEmail(email, username, password);

    res.render('register-success', {
      title: 'Registration Successful - RUH Forum',
      user: null,
      full_name,
      username,
      password,
      email,
      emailSent
    });
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

module.exports = router;
