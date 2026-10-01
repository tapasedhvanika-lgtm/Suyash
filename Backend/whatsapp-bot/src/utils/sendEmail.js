const nodemailer = require('nodemailer');
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM;

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
};

/**
 * Send a plain/HTML email. Fails silently into a thrown error the caller can catch,
 * so a missing SMTP config never crashes the whole request cycle.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const t = getTransporter();
  return t.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    text,
    html,
  });
};

module.exports = sendEmail;
