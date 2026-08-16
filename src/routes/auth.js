const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { User, PasswordResetToken } = require('../models');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendPasswordResetEmail } = require('../utils/mailer');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/register', (req, res) => {
  res.render('auth/register', { user: null, error: null });
});

router.post('/register', async (req, res) => {
  const { name, email, password, department } = req.body;
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).render('auth/register', { user: null, error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, department, role: 'employee' });
    logger.info('user registered', { userId: user.id });
    setAuthCookies(res, user);
    res.redirect('/expenses');
  } catch (err) {
    logger.error('register failed', { error: err.message });
    res.status(500).render('auth/register', { user: null, error: 'Something went wrong' });
  }
});

router.get('/login', (req, res) => {
  res.render('auth/login', { user: null, error: null });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !user.isActive) {
    return res.status(401).render('auth/login', { user: null, error: 'Invalid credentials' });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).render('auth/login', { user: null, error: 'Invalid credentials' });
  }
  setAuthCookies(res, user);
  res.redirect('/expenses');
});

router.get('/logout', (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.redirect('/auth/login');
});

router.post('/refresh', async (req, res) => {
  const token = req.cookies.refresh_token;
  if (!token) return res.status(401).json({ error: 'No refresh token' });
  try {
    const payload = verifyRefreshToken(token);
    const user = await User.findByPk(payload.sub);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    setAuthCookies(res, user);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

router.get('/forgot-password', (req, res) => {
  res.render('auth/forgot-password', { user: null, sent: false });
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    await PasswordResetToken.create({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${token}`;
    await sendPasswordResetEmail(user.email, resetUrl);
  }
  // don't reveal whether the email exists
  res.render('auth/forgot-password', { user: null, sent: true });
});

router.get('/reset-password/:token', async (req, res) => {
  const record = await PasswordResetToken.findOne({ where: { token: req.params.token } });
  if (!record || record.used || record.expiresAt < new Date()) {
    return res.status(400).render('auth/reset-password', { user: null, token: null, error: 'Link is invalid or expired' });
  }
  res.render('auth/reset-password', { user: null, token: req.params.token, error: null });
});

router.post('/reset-password/:token', async (req, res) => {
  const record = await PasswordResetToken.findOne({ where: { token: req.params.token } });
  if (!record || record.used || record.expiresAt < new Date()) {
    return res.status(400).render('auth/reset-password', { user: null, token: null, error: 'Link is invalid or expired' });
  }
  const { password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  await User.update({ passwordHash }, { where: { id: record.userId } });
  record.used = true;
  await record.save();
  res.redirect('/auth/login');
});

function setAuthCookies(res, user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  res.cookie('access_token', accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
  res.cookie('refresh_token', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

module.exports = router;
