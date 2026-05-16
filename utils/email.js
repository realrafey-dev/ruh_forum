const { pool } = require('../config/db');

const sendWelcomeEmail = async (to, username, password) => {
  try {
    const html = `<div style="font-family:Arial;max-width:600px;margin:0 auto;background:#f5f0e8;padding:30px;border-radius:15px;">
      <h1 style="color:#1a5c2a;text-align:center;">🕌 RUH Forum</h1>
      <p style="text-align:center;color:#8b6914;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
      <p>Assalamu Alaikum,<br>Your account has been created.</p>
      <div style="background:white;padding:15px;border-radius:8px;">
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>
      <p style="color:#c0392b;">⚠ Change password after login.</p>
      <p>Jazakallah Khair!</p></div>`;

    await pool.query(
      'INSERT INTO email_queue (to_email, subject, html) VALUES (?, ?, ?)',
      [to, 'Welcome to RUH Forum - Your Account Details', html]
    );
    return true;
  } catch (err) {
    console.error('Queue email error:', err.message);
    return false;
  }
};

const sendDonationReceipt = async (to, name, amount, type) => {
  try {
    const html = `<p>Assalamu Alaikum ${name},</p>
      <p>Thank you! Rs.${amount} - ${type}</p>
      <p>Status: Pending Verification</p>
      <p>Jazakallah Khair!</p>`;

    await pool.query(
      'INSERT INTO email_queue (to_email, subject, html) VALUES (?, ?, ?)',
      [to, 'Donation Receipt - RUH Forum', html]
    );
    return true;
  } catch (err) {
    console.error('Queue email error:', err.message);
    return false;
  }
};

const sendPasswordResetEmail = async (to, token) => {
  try {
    const resetLink = `http://localhost:${process.env.PORT || 3000}/reset-password/${token}`;
    const html = `<div style="font-family:Arial;max-width:600px;margin:0 auto;background:#f5f0e8;padding:30px;border-radius:15px;">
      <h1 style="color:#1a5c2a;text-align:center;">🕌 RUH Forum</h1>
      <p style="text-align:center;color:#8b6914;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
      <p>Assalamu Alaikum,</p>
      <p>We received a request to reset your password.</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${resetLink}" style="background:#1a5c2a;color:white;padding:14px 30px;border-radius:8px;text-decoration:none;font-size:16px;display:inline-block;">Reset Password</a>
      </div>
      <p>Or copy this link: <br>${resetLink}</p>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request this, ignore this email.</p>
      <p>Jazakallah Khair!</p></div>`;

    await pool.query(
      'INSERT INTO email_queue (to_email, subject, html) VALUES (?, ?, ?)',
      [to, 'Password Reset - RUH Forum', html]
    );
    return true;
  } catch (err) {
    console.error('Queue email error:', err.message);
    return false;
  }
};

module.exports = { sendWelcomeEmail, sendDonationReceipt, sendPasswordResetEmail };
