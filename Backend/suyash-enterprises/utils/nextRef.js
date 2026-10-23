// utils/nextRef.js
const SequenceCounter = require('../models/SequenceCounter');

async function nextRef(prefix) {
  const d = new Date();
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;

  const counter = await SequenceCounter.findByIdAndUpdate(
    `${prefix}_${ym}`,
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  return `${prefix}-${ym}-${String(counter.seq).padStart(4, '0')}`;
}

module.exports = nextRef;