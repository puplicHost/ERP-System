const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productName: String,
    productSku: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  taxAmount: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  billingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  }
}, {
  timestamps: true
});

invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ order: 1 });
invoiceSchema.index({ customer: 1, createdAt: -1 });
invoiceSchema.index({ status: 1, dueDate: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
