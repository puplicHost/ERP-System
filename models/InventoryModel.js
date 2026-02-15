const mongoose = require('mongoose');
const { Schema } = mongoose;

const InventorySchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Products', required: true },
  warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  quantity: { type: Number, required: true, default: 0 }
});

InventorySchema.index({ product: 1, warehouse: 1 }, { unique: true });

const InventoryModel = mongoose.model('Inventory', InventorySchema);
module.exports = InventoryModel;
