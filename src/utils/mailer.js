const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  } : undefined,
});

async function sendPasswordResetEmail(to, resetUrl) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@expenseflow.local',
      to,
      subject: 'Reset your ExpenseFlow password',
      text: `Click here to reset your password: ${resetUrl}\nThis link expires in 1 hour.`,
    });
  } catch (err) {
    logger.warn('failed to send reset email', { error: err.message });
  }
}

module.exports = { sendPasswordResetEmail };
