const nodemailer = require('nodemailer');

const sendWelcomeEmail = async (to, username, password) => {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === 're_xxxx') return false;

  try {
    const t = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 587,
      secure: false,
      auth: { user: key, pass: key },
      connectionTimeout: 10000
    });

    await t.sendMail({
      from: 'RUH Forum <onboarding@resend.dev>',
      to,
      subject: 'Welcome to RUH Forum',
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto;background:#f5f0e8;padding:30px;border-radius:15px;">
        <h1 style="color:#1a5c2a;text-align:center;">🕌 RUH Forum</h1>
        <p style="text-align:center;color:#8b6914;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        <p>Assalamu Alaikum,<br>Your account has been created.</p>
        <div style="background:white;padding:15px;border-radius:8px;">
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Password:</strong> ${password}</p>
        </div>
        <p style="color:#c0392b;font-size:12px;">⚠ Please change password after login.</p>
        <p>Jazakallah Khair!</p></div>`
    });

    return true;
  } catch (err) {
    console.error('Email error:', err.message, err.code || '');
    return false;
  }
};

const sendDonationReceipt = async (to, name, amount, type) => {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === 're_xxxx') return false;

  try {
    const t = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 587,
      secure: false,
      auth: { user: key, pass: key },
      connectionTimeout: 10000
    });

    await t.sendMail({
      from: 'RUH Forum <onboarding@resend.dev>',
      to,
      subject: 'Donation Receipt - RUH Forum',
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto;background:#f5f0e8;padding:30px;border-radius:15px;">
        <p>Assalamu Alaikum ${name},</p>
        <p>Thank you for your donation!</p>
        <div style="background:white;padding:15px;border-radius:8px;">
          <p><strong>Amount:</strong> Rs. ${amount}</p>
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>Status:</strong> Pending Verification</p>
        </div>
        <p>Jazakallah Khair!</p></div>`
    });

    return true;
  } catch (err) {
    console.error('Receipt error:', err.message, err.code || '');
    return false;
  }
};

module.exports = { sendWelcomeEmail, sendDonationReceipt };
