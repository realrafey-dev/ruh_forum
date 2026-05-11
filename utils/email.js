const { Resend } = require('resend');

let resend = null;

const getClient = () => {
  if (resend) return resend;
  const key = process.env.RESEND_API_KEY;
  if (!key || key === 're_xxxx') return null;
  resend = new Resend(key);
  return resend;
};

const sendWelcomeEmail = async (to, username, password) => {
  const r = getClient();
  if (!r) return false;

  try {
    await r.emails.send({
      from: 'RUH Forum <onboarding@resend.dev>',
      to,
      subject: 'Welcome to RUH Forum - Your Account Details',
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto; background: #f5f0e8; padding: 30px; border-radius: 15px;">
          <h1 style="color: #1a5c2a; text-align: center;">🕌 RUH Forum</h1>
          <p style="text-align: center; color: #8b6914;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
          <h2 style="color: #1a5c2a;">Welcome to RUH Forum!</h2>
          <p>Assalamu Alaikum,</p>
          <p>Your account has been created. Login details below:</p>
          <div style="background: white; padding: 15px; border-radius: 8px; margin:15px 0;">
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          <p style="color: #c0392b; font-size: 12px;">⚠ Please change your password after logging in.</p>
          <p>Jazakallah Khair!</p>
        </div>
      `
    });
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
};

const sendDonationReceipt = async (to, name, amount, type) => {
  const r = getClient();
  if (!r) return false;

  try {
    await r.emails.send({
      from: 'RUH Forum <onboarding@resend.dev>',
      to,
      subject: 'Donation Receipt - RUH Forum',
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto; background: #f5f0e8; padding: 30px; border-radius: 15px;">
          <h2 style="color: #1a5c2a;">Donation Receipt</h2>
          <p>Assalamu Alaikum ${name},</p>
          <p>Thank you for your generous donation!</p>
          <div style="background: white; padding: 15px; border-radius: 8px;">
            <p><strong>Amount:</strong> Rs. ${amount}</p>
            <p><strong>Type:</strong> ${type}</p>
            <p><strong>Status:</strong> Pending Verification</p>
          </div>
          <p>Jazakallah Khair!</p>
        </div>
      `
    });
    return true;
  } catch (err) {
    console.error('Receipt error:', err.message);
    return false;
  }
};

module.exports = { sendWelcomeEmail, sendDonationReceipt };
