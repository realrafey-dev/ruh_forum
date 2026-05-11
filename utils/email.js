const nodemailer = require('nodemailer');

const getTransporter = () => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS || EMAIL_USER === 'your-email@gmail.com') return null;

  return nodemailer.createTransport({
    host: EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(EMAIL_PORT || '587'),
    secure: false,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000
  });
};

const sendMail = async (to, subject, html) => {
  const t = getTransporter();
  if (!t) return { sent: false, error: 'not_configured' };

  try {
    await t.sendMail({ from: `"RUH Forum" <${process.env.EMAIL_USER}>`, to, subject, html });
    return { sent: true };
  } catch (err) {
    console.error('Email error:', err.message, err.code);
    return { sent: false, error: err.message };
  }
};

const sendWelcomeEmail = async (to, username, password) => {
  const r = await sendMail(to, 'Welcome to RUH Forum',
    `<div style="font-family:Arial;max-width:600px;margin:0 auto;background:#f5f0e8;padding:30px;border-radius:15px;">
      <h1 style="color:#1a5c2a;text-align:center;">🕌 RUH Forum</h1>
      <p style="text-align:center;color:#8b6914;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
      <p>Assalamu Alaikum,<br>Your account has been created.</p>
      <div style="background:white;padding:15px;border-radius:8px;">
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>
      <p style="color:#c0392b;">⚠ Change password after login.</p>
      <p>Jazakallah Khair!</p></div>`
  );
  return r.sent;
};

const sendDonationReceipt = async (to, name, amount, type) => {
  const r = await sendMail(to, 'Donation Receipt - RUH Forum',
    `<div style="font-family:Arial;max-width:600px;margin:0 auto;background:#f5f0e8;padding:30px;border-radius:15px;">
      <p>Assalamu Alaikum ${name},</p>
      <p>Thank you for your donation! (Rs.${amount} - ${type})</p>
      <p>Status: Pending Verification</p>
      <p>Jazakallah Khair!</p></div>`
  );
  return r.sent;
};

module.exports = { sendWelcomeEmail, sendDonationReceipt };
