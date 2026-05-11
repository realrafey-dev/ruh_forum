const { pool } = require('../config/db');

const queueEmail = async (to, subject, html) => {
  try {
    await pool.query(
      'INSERT INTO email_queue (to_email, subject, html) VALUES (?, ?, ?)',
      [to, subject, html]
    );
    return true;
  } catch (err) {
    console.error('Queue error:', err.message);
    return false;
  }
};

const sendWelcomeEmail = async (to, username, password) => {
  return queueEmail(to, 'Welcome to RUH Forum',
    `<div style="font-family:Arial;max-width:600px;margin:0 auto;background:#f5f0e8;padding:30px;border-radius:15px;">
      <h1 style="color:#1a5c2a;text-align:center;">🕌 RUH Forum</h1>
      <p style="text-align:center;color:#8b6914;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
      <p>Assalamu Alaikum,<br>Your account has been created.</p>
      <div style="background:white;padding:15px;border-radius:8px;">
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Password:</strong> ${password}</p></div>
      <p style="color:#c0392b;">⚠ Change password after login.</p>
      <p>Jazakallah Khair!</p></div>`);
};

const sendDonationReceipt = async (to, name, amount, type) => {
  return queueEmail(to, 'Donation Receipt - RUH Forum',
    `<div style="font-family:Arial;max-width:600px;margin:0 auto;background:#f5f0e8;padding:30px;border-radius:15px;">
      <p>Assalamu Alaikum ${name},</p>
      <p>Thank you! Rs.${amount} - ${type}</p>
      <p>Status: Pending</p>
      <p>Jazakallah Khair!</p></div>`);
};

module.exports = { sendWelcomeEmail, sendDonationReceipt };
