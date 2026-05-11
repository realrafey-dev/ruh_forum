const https = require('https');

const sendResend = async (to, subject, html) => {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === 're_xxxx' || key.includes('dummy')) return { sent: false, error: 'no_key' };

  return new Promise((resolve) => {
    const data = JSON.stringify({ from: 'RUH Forum <onboarding@resend.dev>', to, subject, html });

    const req = https.request({
      hostname: 'api.resend.com', path: '/emails', method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => {
        if (res.statusCode === 200) resolve({ sent: true });
        else {
          const errMsg = `Resend ${res.statusCode}: ${body}`;
          console.error(errMsg);
          resolve({ sent: false, error: errMsg });
        }
      });
    });

    req.on('error', (e) => resolve({ sent: false, error: e.message }));
    req.write(data);
    req.end();
  });
};

const sendWelcomeEmail = async (to, username, password) => {
  const r = await sendResend(to, 'Welcome to RUH Forum',
    `<div style="font-family:Arial;max-width:600px;margin:0 auto;background:#f5f0e8;padding:30px;border-radius:15px;">
      <h1 style="color:#1a5c2a;text-align:center;">🕌 RUH Forum</h1>
      <p style="text-align:center;color:#8b6914;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
      <p>Assalamu Alaikum,<br>Your account has been created.</p>
      <div style="background:white;padding:15px;border-radius:8px;">
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>
      <p style="color:#c0392b;">⚠ Change password after login.</p>
      <p>Jazakallah Khair!</p></div>`);
  return r.sent;
};

const sendDonationReceipt = async (to, name, amount, type) => {
  const r = await sendResend(to, 'Donation Receipt - RUH Forum',
    `<div style="font-family:Arial;max-width:600px;margin:0 auto;background:#f5f0e8;padding:30px;border-radius:15px;">
      <p>Assalamu Alaikum ${name},</p>
      <p>Thank you for your donation! (Rs.${amount} - ${type})</p>
      <p>Status: Pending Verification</p>
      <p>Jazakallah Khair!</p></div>`);
  return r.sent;
};

module.exports = { sendWelcomeEmail, sendDonationReceipt };
