const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [campaigns] = await pool.query(
      'SELECT * FROM campaigns WHERE is_active = TRUE ORDER BY created_at DESC'
    );

    res.render('campaigns', {
      title: 'Campaigns - RUH Forum',
      user: req.session.user || null,
      campaigns
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [campaigns] = await pool.query(
      'SELECT * FROM campaigns WHERE id = ?',
      [req.params.id]
    );

    if (campaigns.length === 0) {
      req.flash('error', 'Campaign not found');
      return res.redirect('/campaigns');
    }

    const [donations] = await pool.query(
      `SELECT name, amount, message, is_anonymous, created_at
       FROM donations
       WHERE campaign_id = ? AND status = 'verified'
       ORDER BY created_at DESC`,
      [req.params.id]
    );

    res.render('campaign-detail', {
      title: campaigns[0].title + ' - RUH Forum',
      user: req.session.user || null,
      campaign: campaigns[0],
      donations
    });
  } catch (err) {
    console.error(err);
    res.redirect('/campaigns');
  }
});

router.post('/:id/donate', async (req, res) => {
  try {
    const { name, email, phone, amount, message, is_anonymous } = req.body;
    if (!name || !email || !amount || amount <= 0) {
      req.flash('error', 'All fields required');
      return res.redirect(`/campaigns/${req.params.id}`);
    }

    await pool.query(
      `INSERT INTO donations (user_id, campaign_id, type, name, email, phone, amount, message, is_anonymous)
       VALUES (?, ?, 'campaign', ?, ?, ?, ?, ?, ?)`,
      [req.session.user?.id || null, req.params.id, name, email, phone, amount, message, is_anonymous === 'on']
    );

    await pool.query(
      'UPDATE campaigns SET raised_amount = raised_amount + ? WHERE id = ?',
      [amount, req.params.id]
    );

    req.flash('success', 'Campaign donation submitted! Jazakallah Khair.');
    res.redirect('/campaigns');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Donation failed');
    res.redirect(`/campaigns/${req.params.id}`);
  }
});

module.exports = router;
