const mongoose = require('mongoose');
const cartItemSchema = require('./CartItem');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

cartSchema.index({ user: 1 });

// Calculate total amount before saving
cartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
