require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3020,
  NODE_ENV: process.env.NODE_ENV || 'development',
  BASE_URL: process.env.BASE_URL || 'https://codiantsolutions.com',

  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/whatsapp_product_bot',

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'asdfghjkjhgfdswwsdfghjjhgfdsasdfghjbvfdsdfg',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'wdcvfrgnhtyhmjyjmjyhngfdsdfghfdsdfghnvcxcv',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '100d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  RESET_PASSWORD_TOKEN_EXPIRES_MIN: Number(process.env.RESET_PASSWORD_TOKEN_EXPIRES_MIN || 30),

  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true' || false,

  SEED_ADMIN_NAME: process.env.SEED_ADMIN_NAME || 'Super Admin',
  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL || 'admin@example.com',
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
  SEED_ADMIN_PHONE: process.env.SEED_ADMIN_PHONE || '7588192394',

  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: Number(process.env.SMTP_PORT || 587),
  SMTP_USER: process.env.SMTP_USER || 'your_email@gmail.com',
  SMTP_PASS: process.env.SMTP_PASS || 'your_app_password',
  SMTP_FROM: process.env.SMTP_FROM || 'WhatsApp Product Bot <no-reply@example.com>',

    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_WABA_ID: process.env.WHATSAPP_WABA_ID,
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN,
  WHATSAPP_API_VERSION: process.env.WHATSAPP_API_VERSION || 'v21.0',

  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
};
