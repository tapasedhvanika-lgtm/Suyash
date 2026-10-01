
// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const productSchema = new Schema(
//   {
//     itemName: { type: String, required: true, trim: true },
//     description: { type: String, trim: true, default: '' },
//     itemCode: { type: String, required: true, unique: true, trim: true },
//     mrp: { type: Number, required: true, min: 0 },
//     bestPrice: { type: Number, required: true, min: 0 },
//     weight: { type: String, trim: true, default: '' },
//     benefits: { type: String, trim: true, default: '' }, // "why buy from us"
//     image: { type: String, default: null },
//     category: { type: String, trim: true, default: 'General' },
//     stock: { type: Number, default: 0, min: 0 },
//     active: { type: Boolean, default: true },
//   },
//   { timestamps: true }
// );

// productSchema.index({ itemName: 'text', description: 'text', benefits: 'text' });

// module.exports = mongoose.model('Product', productSchema);
const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    itemName: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    itemCode: { type: String, required: true, unique: true, trim: true },
    mrp: { type: Number, required: true, min: 0 },
    bestPrice: { type: Number, required: true, min: 0 },
    weight: { type: String, trim: true, default: '' },
    benefits: { type: String, trim: true, default: '' },
    image: { type: String, default: null },
    category: { type: String, trim: true, default: 'General' },
    stock: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ itemName: 'text', description: 'text', benefits: 'text' });

module.exports = mongoose.model('Product', productSchema);