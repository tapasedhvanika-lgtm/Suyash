/**
 * One-time bootstrap script: creates the single admin account from .env values.
 * Run with: node scripts/seedAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../src/models/Admin');
const { MONGO_URI, SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_PHONE } = require('../src/config/env');

const run = async () => {
  await mongoose.connect(MONGO_URI);

  const existing = await Admin.findOne({ email: SEED_ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin with email ${SEED_ADMIN_EMAIL} already exists. Skipping.`);
    process.exit(0);
  }

  const admin = await Admin.create({
    name: SEED_ADMIN_NAME,
    email: SEED_ADMIN_EMAIL,
    password: SEED_ADMIN_PASSWORD,
    phone: SEED_ADMIN_PHONE,
    status: 'Active',
  });

  console.log('Admin created:', admin.toSafeObject());
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
