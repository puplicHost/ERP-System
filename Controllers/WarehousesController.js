const WarehouseModel = require('../models/WarehouseModel');
const asyncWrapper = require('../utils/asyncWrapper');
const { isValidObjectId } = require('../utils/validators');

const getAllWarehouses = asyncWrapper(async (req, res) => {
  const warehouses = await WarehouseModel.find().populate('assignedTo', 'FirstName lastName email Role');
  res.status(200).json({ status: 'success', data: { warehouses } });
});

const getWarehouse = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  
  if (!isValidObjectId(id)) {
    return res.status(400).json({ status: 'error', message: 'Invalid warehouse ID format' });
  }
  
  const warehouse = await WarehouseModel.findById(id).populate('assignedTo', 'FirstName lastName email Role');
  if (!warehouse) return res.status(404).json({ status: 'error', message: 'Warehouse not found' });
  res.status(200).json({ status: 'success', data: { warehouse } });
});

const createWarehouse = asyncWrapper(async (req, res) => {
  const { name, address, phone } = req.body;
  if (!name) return res.status(400).json({ status: 'error', message: 'Name is required' });
  const newWarehouse = await WarehouseModel.create({ name, address, phone });
  res.status(201).json({ status: 'success', data: { warehouse: newWarehouse } });
});

const updateWarehouse = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  
  if (!isValidObjectId(id)) {
    return res.status(400).json({ status: 'error', message: 'Invalid warehouse ID format' });
  }
  
  const updates = req.body;
  const warehouse = await WarehouseModel.findByIdAndUpdate(id, updates, { new: true });
  if (!warehouse) return res.status(404).json({ status: 'error', message: 'Warehouse not found' });
  res.status(200).json({ status: 'success', data: { warehouse } });
});

const deleteWarehouse = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  
  if (!isValidObjectId(id)) {
    return res.status(400).json({ status: 'error', message: 'Invalid warehouse ID format' });
  }
  
  const warehouse = await WarehouseModel.findByIdAndDelete(id);
  if (!warehouse) return res.status(404).json({ status: 'error', message: 'Warehouse not found' });
  res.status(200).json({ status: 'success', message: 'Warehouse deleted' });
});

// assign warehouse to distributor
const assignWarehouse = asyncWrapper(async (req, res) => {
  const { id } = req.params; // warehouse id
  const { distributorId } = req.body;
  
  if (!isValidObjectId(id)) {
    return res.status(400).json({ status: 'error', message: 'Invalid warehouse ID format' });
  }
  
  if (!distributorId || !isValidObjectId(distributorId)) {
    return res.status(400).json({ status: 'error', message: 'Valid distributorId is required' });
  }
  
  const warehouse = await WarehouseModel.findByIdAndUpdate(id, { assignedTo: distributorId }, { new: true }).populate('assignedTo', 'FirstName lastName email Role');
  if (!warehouse) return res.status(404).json({ status: 'error', message: 'Warehouse not found' });
  res.status(200).json({ status: 'success', data: { warehouse } });
});

module.exports = {
  getAllWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  assignWarehouse
};
