const https = require('https');

const sendViaResend = async (to, subject, html) => {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === 're_xxxx' || key.startsWith('re_')) return 'no_key';

  return new Promise((resolve) => {
    const data = JSON.stringify({
      from: 'RUH Forum <onboarding@resend.dev>',
      to,
      subject,
      html
    });

    const req = https.request({
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) resolve(true);
        else { console.error('Resend error:', body); resolve(false); }
      });
    });

    req.on('error', (err) => { console.error('Resend req error:', err.message); resolve(false); });
    req.write(data);
    req.end();
  });
};

const sendWelcomeEmail = async (to, username, password) => {
  const result = await sendViaResend(to, 'Welcome to RUH Forum',
    `<div style="font-family:Arial;max-width:600px;margin:0 auto;background:#f5f0e8;padding:30px;border-radius:15px;">
      <h1 style="color:#1a5c2a;text-align:center;">🕌 RUH Forum</h1>
      <p style="text-align:center;color:#8b6914;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
      <p>Assalamu Alaikum,<br>Your account has been created.</p>
      <div style="background:white;padding:15px;border-radius:8px;">
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>
      <p style="color:#c0392b;font-size:12px;">⚠ Change password after login.</p>
      <p>Jazakallah Khair!</p></div>`
  );
  return result === true;
};

const sendDonationReceipt = async (to, name, amount, type) => {
  const result = await sendViaResend(to, 'Donation Receipt - RUH Forum',
    `<div style="font-family:Arial;max-width:600px;margin:0 auto;background:#f5f0e8;padding:30px;border-radius:15px;">
      <p>Assalamu Alaikum ${name},</p>
      <p>Thank you for your donation! (Rs.${amount} - ${type})</p>
      <p>Status: Pending Verification</p>
      <p>Jazakallah Khair!</p></div>`
  );
  return result === true;
};

module.exports = { sendWelcomeEmail, sendDonationReceipt };
