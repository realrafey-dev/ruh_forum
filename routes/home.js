const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [stats] = await pool.query(
      `SELECT
        COUNT(DISTINCT d.id) as total_donations,
        COALESCE(SUM(d.amount), 0) as total_raised,
        (SELECT COUNT(*) FROM trusts WHERE is_active = TRUE) as total_trusts,
        (SELECT COUNT(*) FROM campaigns WHERE is_active = TRUE) as total_campaigns
       FROM donations d WHERE d.status = 'verified'`
    );

    const [campaigns] = await pool.query(
      'SELECT * FROM campaigns WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 3'
    );

    res.render('index', {
      title: 'RUH Forum - Islamic Donation Platform',
      user: req.session.user || null,
      stats: stats[0],
      campaigns
    });
  } catch (err) {
    console.error(err);
    res.render('index', {
      title: 'RUH Forum - Islamic Donation Platform',
      user: req.session.user || null,
      stats: null,
      campaigns: []
    });
  }
});

module.exports = router;
