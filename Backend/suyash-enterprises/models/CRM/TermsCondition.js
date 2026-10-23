// const mongoose = require('mongoose');

// const termsConditionSchema = new mongoose.Schema({
//   Title: {
//     type: String,
//     required: [true, 'Title is required'],
//     trim: true
//   },
//   Description: {
//     type: String,
//     required: [true, 'Description is required']
//   },
//   Sequence: {
//     type: Number,
//     required: true,
//     min: 1
//   }
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('TermsCondition', termsConditionSchema);

const mongoose = require('mongoose');

const termsConditionSchema = new mongoose.Schema({
  Title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  Description: {
    type: String,
    required: [true, 'Description is required']
  },
  Sequence: {
    type: Number,
    required: true,
    min: 1
  },
  Status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Inactive'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TermsCondition', termsConditionSchema);