const mongoose = require('mongoose');
const { Schema } = mongoose;

const WarehouseSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' } // distributor assignment
});

const WarehouseModel = mongoose.model('Warehouse', WarehouseSchema);
module.exports = WarehouseModel;
