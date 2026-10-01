'use strict';
const mongoose = require('mongoose');

const sequenceCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

// IMPORTANT: Export the model
module.exports = mongoose.model('SequenceCounter', sequenceCounterSchema);