const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  costPrice: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    default: 'piece',
    trim: true
  },
  weight: {
    type: Number,
    default: null
  },
  dimensions: {
    length: { type: Number, default: null },
    width: { type: Number, default: null },
    height: { type: Number, default: null }
  },
  barcode: {
    type: String,
    default: null,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  minStockLevel: {
    type: Number,
    default: 10,
    min: 0
  },
  maxStockLevel: {
    type: Number,
    default: 1000,
    min: 0
  },
  reorderPoint: {
    type: Number,
    default: 50,
    min: 0
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  images: [{
    type: String
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for faster searches
productSchema.index({ sku: 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
