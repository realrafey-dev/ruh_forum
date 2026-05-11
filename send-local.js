/**
 * Local email sender - Run this on YOUR PC to send queued emails
 * Usage: node send-local.js
 * 
 * Railway MySQL credentials needed (from Railway dashboard):
 *   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 */
 
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');

const config = {
  host: process.env.DB_HOST || 'yamabiko.proxy.rlwy.net',
  port: parseInt(process.env.DB_PORT || '42761'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'CmIvgxbnnMNKyNGoCPipWenGHIwxmuwZ',
  database: process.env.DB_NAME || 'railway'
};

const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'muhammadrafeykhan@gmail.com',
    pass: 'djhj vamw vtvs epeb'
  }
};

async function main() {
  console.log('Connecting to Railway MySQL...');
  const conn = await mysql.createConnection(config);
  console.log('Connected!');

  const [rows] = await conn.query(
    "SELECT * FROM email_queue WHERE status = 'pending' ORDER BY created_at ASC LIMIT 10"
  );

  if (rows.length === 0) {
    console.log('No pending emails.');
    await conn.end();
    return;
  }

  console.log(`Found ${rows.length} pending email(s). Sending...`);
  const transporter = nodemailer.createTransport(emailConfig);

  for (const row of rows) {
    try {
      await transporter.sendMail({
        from: `"RUH Forum" <${emailConfig.auth.user}>`,
        to: row.to_email,
        subject: row.subject,
        html: row.html
      });
      await conn.query("UPDATE email_queue SET status = 'sent' WHERE id = ?", [row.id]);
      console.log(`✅ Sent to ${row.to_email}`);
    } catch (err) {
      console.error(`❌ Failed for ${row.to_email}: ${err.message}`);
      await conn.query("UPDATE email_queue SET status = 'failed', error_msg = ? WHERE id = ?",
        [err.message, row.id]);
    }
  }

  await conn.end();
  console.log('Done!');
}

main().catch(err => console.error('Error:', err.message));
