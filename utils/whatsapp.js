let Client, LocalAuth, qrcode;
try {
  const ww = require('whatsapp-web.js');
  Client = ww.Client;
  LocalAuth = ww.LocalAuth;
  qrcode = require('qrcode');
} catch (e) {
  console.log('WhatsApp web.js not installed. To enable, run: npm install whatsapp-web.js qrcode');
}

require('dotenv').config();

let client = null;
let isReady = false;
let qrCodeData = null;

const initWhatsApp = async () => {
  if (process.env.WHATSAPP_ENABLED !== 'true') {
    console.log('WhatsApp integration is disabled');
    return null;
  }

  if (!Client) {
    console.log('whatsapp-web.js not installed');
    return null;
  }

  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
  });

  client.on('qr', async (qr) => {
    qrCodeData = await qrcode.toDataURL(qr);
    console.log('WhatsApp QR code generated - scan with your phone');
  });

  client.on('ready', () => {
    isReady = true;
    console.log('WhatsApp client is ready!');
  });

  client.on('disconnected', (reason) => {
    isReady = false;
    console.log('WhatsApp disconnected:', reason);
  });

  try {
    await client.initialize();
  } catch (err) {
    console.error('WhatsApp init error:', err.message);
    return null;
  }

  return client;
};

const sendWhatsAppMessage = async (phone, message) => {
  if (!client || !isReady) {
    console.log('WhatsApp not ready, message not sent:', phone);
    return false;
  }

  try {
    const formattedNumber = phone.includes('@c.us') ? phone : `${phone}@c.us`;
    await client.sendMessage(formattedNumber, message);
    return true;
  } catch (err) {
    console.error('WhatsApp send failed:', err.message);
    return false;
  }
};

const getQRCode = () => qrCodeData;
const getWhatsAppStatus = () => ({ isReady, hasClient: !!client });

module.exports = { initWhatsApp, sendWhatsAppMessage, getQRCode, getWhatsAppStatus };
