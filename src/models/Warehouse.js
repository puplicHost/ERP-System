const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  code: {
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
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    }
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  contactPhone: {
    type: String,
    default: null
  },
  email: {
    type: String,
    default: null,
    lowercase: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  capacity: {
    type: Number,
    default: null,
    min: 0
  },
  operatingHours: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

warehouseSchema.index({ code: 1 });
warehouseSchema.index({ city: 1, isActive: 1 });

module.exports = mongoose.model('Warehouse', warehouseSchema);
