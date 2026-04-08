const InventoryModel = require('../models/InventoryModel');
const ProductsModel = require('../models/ProductsModel');
const WarehouseModel = require('../models/WarehouseModel');
const asyncWrapper = require('../utils/asyncWrapper');
const { isValidObjectId } = require('../utils/validators');

const getAllInventory = asyncWrapper(async (req, res) => {
  const items = await InventoryModel.find().populate('product', 'name price category').populate('warehouse', 'name address');
  res.status(200).json({ status: 'success', data: { items } });
});

const getInventoryItem = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  
  if (!isValidObjectId(id)) {
    return res.status(400).json({ status: 'error', message: 'Invalid inventory ID format' });
  }
  
  const item = await InventoryModel.findById(id).populate('product', 'name price category').populate('warehouse', 'name address');
  if (!item) return res.status(404).json({ status: 'error', message: 'Inventory item not found' });
  res.status(200).json({ status: 'success', data: { item } });
});

const createOrUpdateInventory = asyncWrapper(async (req, res) => {
  const { productId, warehouseId, quantity } = req.body;
  if (!productId || !warehouseId || quantity == null) return res.status(400).json({ status: 'error', message: 'productId, warehouseId and quantity are required' });

  // ensure product and warehouse exist
  const product = await ProductsModel.findById(productId);
  const warehouse = await WarehouseModel.findById(warehouseId);
  if (!product) return res.status(404).json({ status: 'error', message: 'Product not found' });
  if (!warehouse) return res.status(404).json({ status: 'error', message: 'Warehouse not found' });

  const updated = await InventoryModel.findOneAndUpdate(
    { product: productId, warehouse: warehouseId },
    { $set: { quantity } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate('product', 'name price').populate('warehouse', 'name');

  res.status(200).json({ status: 'success', data: { item: updated } });
});

const adjustInventory = asyncWrapper(async (req, res) => {
  const { productId, warehouseId, delta } = req.body;
  if (!productId || !warehouseId || delta == null) {
    return res.status(400).json({ status: 'error', message: 'productId, warehouseId and delta are required' });
  }

  // Validate ObjectIds
  if (!isValidObjectId(productId) || !isValidObjectId(warehouseId)) {
    return res.status(400).json({ status: 'error', message: 'Invalid productId or warehouseId format' });
  }

  // Atomic update with $inc and validation
  // If delta is negative, ensure quantity won't go below 0
  const updateQuery = delta >= 0 
    ? { $inc: { quantity: delta } }
    : { 
        $inc: { quantity: delta },
        $min: { quantity: 0 }  // Ensure minimum is 0
      };

  const item = await InventoryModel.findOneAndUpdate(
    { 
      product: productId, 
      warehouse: warehouseId,
      // For negative delta, ensure current quantity is sufficient
      ...(delta < 0 && { $expr: { $gte: ['$quantity', Math.abs(delta)] } })
    },
    updateQuery,
    { new: true, upsert: delta >= 0 } // Only upsert for positive delta
  ).populate('product', 'name price').populate('warehouse', 'name');

  if (!item) {
    if (delta < 0) {
      return res.status(400).json({ status: 'error', message: 'Insufficient quantity or inventory item not found' });
    }
    return res.status(404).json({ status: 'error', message: 'Inventory item not found' });
  }

  res.status(200).json({ status: 'success', data: { item } });
});

const deleteInventory = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  
  if (!isValidObjectId(id)) {
    return res.status(400).json({ status: 'error', message: 'Invalid inventory ID format' });
  }
  
  const item = await InventoryModel.findByIdAndDelete(id);
  if (!item) {
    return res.status(404).json({ status: 'error', message: 'Inventory item not found' });
  }
  
  res.status(200).json({ status: 'success', message: 'Inventory item deleted' });
});

module.exports = {
  getAllInventory,
  getInventoryItem,
  createOrUpdateInventory,
  adjustInventory,
  deleteInventory
};
