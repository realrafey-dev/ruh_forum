const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
require('dotenv').config({ path: __dirname + '/.env' });

const { initDB } = require('./config/db');
const { initWhatsApp, getQRCode, getWhatsAppStatus } = require('./utils/whatsapp');

const app = express();

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'ruh_forum_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.info = req.flash('info');
  res.locals.user = req.session.user || null;
  next();
});

app.use('/', require('./routes/home'));
app.use('/', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/donate', require('./routes/donate'));
app.use('/trusts', require('./routes/trust'));
app.use('/campaigns', require('./routes/campaign'));
app.use('/zakat', require('./routes/zakat'));
app.use('/whatsapp', require('./routes/whatsapp'));
app.use('/admin', require('./routes/admin'));
app.use('/change-password', require('./routes/change-password'));

app.use((req, res) => {
  res.status(404).render('404', { title: '404 - RUH Forum', user: req.session.user || null });
});

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`RUH Forum running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Startup error:', err.message);
  }
};

start();

module.exports = app;
