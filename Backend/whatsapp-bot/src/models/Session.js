const mongoose = require('mongoose');
const { Schema } = mongoose;

const sessionSchema = new Schema(
  {
    phoneNumber: { type: String, required: true, unique: true, index: true },
    lastProductId: { type: Schema.Types.ObjectId, ref: 'Product', default: null },
    state: {
      type: String,
      enum: [
        'GREETED',
        'BROWSING',
        'VIEWING_PRODUCT',
        'AI_QNA',
        'HANDOFF',
        'AWAITING_QUOTE_ITEM',
        'QUOTED',
        'ORDERING',
      ],
      default: 'GREETED',
    },
    history: [
      {
        role: { type: String, enum: ['user', 'assistant'] },
        content: String,
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.model('Session', sessionSchema);
