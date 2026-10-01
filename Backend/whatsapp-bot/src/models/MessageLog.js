const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageLogSchema = new Schema(
  {
    phoneNumber: { type: String, required: true, index: true },
    direction: { type: String, enum: ['inbound', 'outbound'], required: true },
    body: { type: String, default: '' },
    messageType: { type: String, default: 'text' },
    raw: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('MessageLog', messageLogSchema);
