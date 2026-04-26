const mongoose = require('mongoose');
const orderItemSchema = require('./OrderItem');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  billingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  assignedWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    default: null
  },
  assignedDistributor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  estimatedDelivery: {
    type: Date,
    default: null
  },
  actualDelivery: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ assignedWarehouse: 1, status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, paymentStatus: 1 });

// Calculate total amount before saving
orderSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + item.totalPrice, 0) - this.discountAmount + this.taxAmount;
  next();
});

module.exports = mongoose.model('Order', orderSchema);
