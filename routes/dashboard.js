const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const [donations] = await pool.query(
      `SELECT COUNT(*) as total_donations, COALESCE(SUM(amount), 0) as total_amount
       FROM donations WHERE user_id = ? AND status = 'verified'`,
      [req.session.user.id]
    );

    const [trusts] = await pool.query(
      'SELECT COUNT(*) as total_trusts FROM trusts WHERE user_id = ?',
      [req.session.user.id]
    );

    const [recentDonations] = await pool.query(
      `SELECT d.*, t.title as trust_title
       FROM donations d
       LEFT JOIN trusts t ON d.trust_id = t.id
       WHERE d.user_id = ? OR d.email = ?
       ORDER BY d.created_at DESC LIMIT 5`,
      [req.session.user.id, req.session.user.email]
    );

    res.render('dashboard', {
      title: 'Dashboard - RUH Forum',
      user: req.session.user,
      stats: {
        donations: donations[0].total_donations,
        amount: donations[0].total_amount,
        trusts: trusts[0].total_trusts
      },
      recentDonations
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

module.exports = router;
