const nodemailer = require('nodemailer');

const sendMail = async (to, subject, html) => {
  const { EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS || EMAIL_USER === 'your-email@gmail.com') return false;

  const configs = [
    { host: 'smtp.gmail.com', port: 465, secure: true },
    { host: 'smtp.gmail.com', port: 587, secure: false },
    { host: 'smtp.gmail.com', port: 25, secure: false }
  ];

  for (const cfg of configs) {
    try {
      const t = nodemailer.createTransport({
        host: cfg.host, port: cfg.port, secure: cfg.secure,
        auth: { user: EMAIL_USER, pass: EMAIL_PASS },
        connectionTimeout: 5000, greetingTimeout: 5000,
        tls: { rejectUnauthorized: false }
      });
      await t.sendMail({ from: `"RUH Forum" <${EMAIL_USER}>`, to, subject, html });
      console.log(`Email sent via port ${cfg.port}`);
      return true;
    } catch (e) {
      console.log(`Port ${cfg.port} failed: ${e.code || e.message}`);
    }
  }
  return false;
};

const sendWelcomeEmail = async (to, username, password) =>
  sendMail(to, 'Welcome to RUH Forum',
    `<div style="font-family:Arial;max-width:600px;margin:0 auto;background:#f5f0e8;padding:30px;border-radius:15px;">
      <h1 style="color:#1a5c2a;text-align:center;">🕌 RUH Forum</h1>
      <p style="text-align:center;color:#8b6914;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
      <p>Assalamu Alaikum,<br>Your account has been created.</p>
      <div style="background:white;padding:15px;border-radius:8px;">
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Password:</strong> ${password}</p></div>
      <p style="color:#c0392b;">⚠ Change password after login.</p>
      <p>Jazakallah Khair!</p></div>`);

const sendDonationReceipt = async (to, name, amount, type) =>
  sendMail(to, 'Donation Receipt - RUH Forum',
    `<div style="font-family:Arial;max-width:600px;margin:0 auto;background:#f5f0e8;padding:30px;border-radius:15px;">
      <p>Assalamu Alaikum ${name},</p>
      <p>Thank you! Rs.${amount} - ${type}</p>
      <p>Status: Pending</p>
      <p>Jazakallah Khair!</p></div>`);

module.exports = { sendWelcomeEmail, sendDonationReceipt };
