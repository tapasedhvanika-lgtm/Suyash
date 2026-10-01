// fixCounter.js
require('dotenv').config();
const mongoose = require('mongoose');

// Import models properly
const Counter = require('../models/CRM/Counter');
const Vendor = require('../models/CRM/Vendor');

async function fixCounter() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected successfully');
    
    // Check existing vendors to find the highest sequence
    const lastVendor = await Vendor.findOne().sort({ vendor_id: -1 });
    let correctSequence = 0;
    
    if (lastVendor && lastVendor.vendor_id) {
      console.log(`\nLast vendor found: ${lastVendor.vendor_id}`);
      const match = lastVendor.vendor_id.match(/VND-\d{6}-(\d{4})/);
      if (match) {
        correctSequence = parseInt(match[1]);
        console.log(`Highest sequence found: ${correctSequence}`);
      }
    } else {
      console.log('No vendors found, starting from 0');
    }
    
    // Update or create counter with correct sequence
    const counter = await Counter.findOneAndUpdate(
      { name: 'vendor_id' },
      { $set: { sequence_value: correctSequence } },
      { new: true, upsert: true }
    );
    
    console.log(`\n✅ Counter updated successfully!`);
    console.log(`Counter name: ${counter.name}`);
    console.log(`Current sequence: ${counter.sequence_value}`);
    console.log(`Next vendor ID will be: VND-${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2,'0')}-${(counter.sequence_value + 1).toString().padStart(4,'0')}`);
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixCounter();