const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass || user === 'your-email@gmail.com') {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000
  });

  return transporter;
};

const sendWelcomeEmail = async (to, username, password) => {
  const t = getTransporter();
  if (!t) {
    console.log('Email not configured - skipping welcome email');
    return false;
  }

  try {
    await t.sendMail({
      from: `"RUH Forum" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Welcome to RUH Forum - Your Account Details',
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto; background: #f5f0e8; padding: 30px; border-radius: 15px; border: 2px solid #c9a96e;">
          <h1 style="color: #1a5c2a; text-align: center;">🕌 RUH Forum</h1>
          <p style="text-align: center; color: #8b6914;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
          <h2 style="color: #1a5c2a;">Welcome to RUH Forum!</h2>
          <p>Assalamu Alaikum,</p>
          <p>Your account has been created. Login details:</p>
          <div style="background: white; padding: 15px; border-radius: 8px;">
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
    console.error('Email sending failed:', err.message);
    return false;
  }
};

const sendDonationReceipt = async (to, name, amount, type) => {
  const t = getTransporter();
  if (!t) return false;

  try {
    await t.sendMail({
      from: `"RUH Forum" <${process.env.EMAIL_USER}>`,
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
    console.error('Receipt email failed:', err.message);
    return false;
  }
};

module.exports = { sendWelcomeEmail, sendDonationReceipt };
