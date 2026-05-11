const express = require('express');
const router = express.Router();
const { getQRCode, getWhatsAppStatus } = require('../utils/whatsapp');

router.get('/status', (req, res) => {
  const status = getWhatsAppStatus();
  res.json(status);
});

router.get('/qr', (req, res) => {
  const qr = getQRCode();
  if (qr) {
    res.json({ qr });
  } else {
    res.json({ error: 'QR not available' });
  }
});

module.exports = router;
