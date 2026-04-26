const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['in', 'out', 'adjustment', 'transfer']
  },
  quantity: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    default: ''
  },
  reference: {
    type: String,
    default: null
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  previousQuantity: {
    type: Number,
    required: true
  },
  newQuantity: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

stockMovementSchema.index({ product: 1, createdAt: -1 });
stockMovementSchema.index({ warehouse: 1, createdAt: -1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
