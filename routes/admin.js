const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
require('dotenv').config({ path: __dirname + '/../.env' });

const isAdmin = async (req, res, next) => {
  if (!req.session.user) {
    req.flash('error', 'Please login as admin');
    return res.redirect('/login');
  }

  const [admins] = await pool.query(
    'SELECT id FROM admins WHERE user_id = ?',
    [req.session.user.id]
  );

  if (admins.length === 0) {
    req.flash('error', 'Access denied. Admins only.');
    return res.redirect('/');
  }

  next();
};

router.get('/', isAdmin, async (req, res) => {
  try {
    const [[donationStats]] = await pool.query(
      `SELECT COUNT(*) as total, COALESCE(SUM(amount),0) as amount FROM donations`
    );
    const [[userCount]] = await pool.query('SELECT COUNT(*) as total FROM users');
    const [[trustCount]] = await pool.query('SELECT COUNT(*) as total FROM trusts');
    const [recentDonations] = await pool.query(
      `SELECT d.*, t.title as trust_title
       FROM donations d LEFT JOIN trusts t ON d.trust_id = t.id
       ORDER BY d.created_at DESC LIMIT 10`
    );

    res.render('admin/dashboard', {
      title: 'Admin - RUH Forum',
      user: req.session.user,
      stats: {
        donations: donationStats.total,
        amount: donationStats.amount,
        users: userCount.total,
        trusts: trustCount.total
      },
      recentDonations
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

router.get('/donations', isAdmin, async (req, res) => {
  try {
    const [donations] = await pool.query(
      `SELECT d.*, t.title as trust_title, c.title as campaign_title
       FROM donations d
       LEFT JOIN trusts t ON d.trust_id = t.id
       LEFT JOIN campaigns c ON d.campaign_id = c.id
       ORDER BY d.created_at DESC`
    );

    res.render('admin/donations', {
      title: 'Manage Donations - RUH Forum',
      user: req.session.user,
      donations
    });
  } catch (err) {
    console.error(err);
    res.redirect('/admin');
  }
});

router.post('/donations/:id/:action', isAdmin, async (req, res) => {
  try {
    const { id, action } = req.params;
    if (!['verified', 'rejected'].includes(action)) {
      req.flash('error', 'Invalid action');
      return res.redirect('/admin/donations');
    }

    const [donations] = await pool.query('SELECT * FROM donations WHERE id = ?', [id]);
    if (donations.length === 0) {
      req.flash('error', 'Donation not found');
      return res.redirect('/admin/donations');
    }

    await pool.query('UPDATE donations SET status = ? WHERE id = ?', [action, id]);

    if (action === 'verified' && donations[0].trust_id) {
      await pool.query('UPDATE trusts SET raised_amount = raised_amount + ? WHERE id = ?',
        [donations[0].amount, donations[0].trust_id]);
    }

    if (action === 'verified' && donations[0].campaign_id) {
      await pool.query('UPDATE campaigns SET raised_amount = raised_amount + ? WHERE id = ?',
        [donations[0].amount, donations[0].campaign_id]);
    }

    req.flash('success', `Donation #${id} ${action} successfully!`);
    res.redirect('/admin/donations');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update donation');
    res.redirect('/admin/donations');
  }
});

router.get('/campaigns/create', isAdmin, (req, res) => {
  res.render('admin/create-campaign', {
    title: 'Create Campaign - RUH Forum',
    user: req.session.user
  });
});

router.post('/campaigns/create', isAdmin, async (req, res) => {
  try {
    const { title, description, category, target_amount, start_date, end_date } = req.body;
    if (!title) {
      req.flash('error', 'Title is required');
      return res.redirect('/admin/campaigns/create');
    }

    await pool.query(
      `INSERT INTO campaigns (title, description, category, target_amount, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, category || 'general', target_amount || 0, start_date || null, end_date || null]
    );

    req.flash('success', 'Campaign created successfully!');
    res.redirect('/campaigns');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to create campaign');
    res.redirect('/admin/campaigns/create');
  }
});

module.exports = router;
