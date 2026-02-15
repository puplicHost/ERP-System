const InventoryModel = require('../models/InventoryModel');
const ProductsModel = require('../models/ProductsModel');
const WarehouseModel = require('../models/WarehouseModel');
const asyncWrapper = require('../utils/asyncWrapper');

const getAllInventory = asyncWrapper(async (req, res) => {
  const items = await InventoryModel.find().populate('product', 'name price category').populate('warehouse', 'name address');
  res.status(200).json({ status: 'success', data: { items } });
});

const getInventoryItem = asyncWrapper(async (req, res) => {
  const { id } = req.params;
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
  const { productId, warehouseId, delta } = req.body; // delta can be positive or negative
  if (!productId || !warehouseId || delta == null) return res.status(400).json({ status: 'error', message: 'productId, warehouseId and delta are required' });

  const item = await InventoryModel.findOne({ product: productId, warehouse: warehouseId });
  if (!item) return res.status(404).json({ status: 'error', message: 'Inventory item not found' });
  item.quantity = item.quantity + Number(delta);
  if (item.quantity < 0) return res.status(400).json({ status: 'error', message: 'Resulting quantity cannot be negative' });
  await item.save();
  res.status(200).json({ status: 'success', data: { item } });
});

const deleteInventory = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  await InventoryModel.findByIdAndDelete(id);
  res.status(200).json({ status: 'success', message: 'Inventory item deleted' });
});

module.exports = {
  getAllInventory,
  getInventoryItem,
  createOrUpdateInventory,
  adjustInventory,
  deleteInventory
};
