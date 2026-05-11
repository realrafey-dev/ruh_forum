const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('zakat', {
    title: 'Zakat Calculator - RUH Forum',
    user: req.session.user || null
  });
});

router.post('/calculate', (req, res) => {
  const { gold, silver, cash, business, property } = req.body;
  const total = (parseFloat(gold) || 0) + (parseFloat(silver) || 0) +
                (parseFloat(cash) || 0) + (parseFloat(business) || 0) +
                (parseFloat(property) || 0);
  const zakatDue = total * 0.025;
  const nisabGold = 85000;
  const nisabSilver = 5950;
  const eligible = total >= nisabGold;

  res.render('zakat', {
    title: 'Zakat Calculator - RUH Forum',
    user: req.session.user || null,
    result: {
      total,
      zakatDue,
      nisabGold,
      nisabSilver,
      eligible
    }
  });
});

module.exports = router;
