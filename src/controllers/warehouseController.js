const Warehouse = require('../models/Warehouse');
const User = require('../models/User');
const Role = require('../models/Role');
const paginate = require('../utils/pagination');

const createWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.create(req.body);
    res.success(warehouse, 'Warehouse created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const listWarehouses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const query = {};

    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';
    if (req.query.city) query['location.city'] = req.query.city;

    const result = await paginate(Warehouse, query, page, limit);
    
    const warehouses = await Warehouse.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('manager', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.success({
      warehouses,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const getWarehouseById = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id)
      .populate('manager', 'firstName lastName email');
    
    if (!warehouse) {
      return res.error('Warehouse not found', 404);
    }

    res.success(warehouse);
  } catch (error) {
    next(error);
  }
};

const updateWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!warehouse) {
      return res.error('Warehouse not found', 404);
    }

    res.success(warehouse, 'Warehouse updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!warehouse) {
      return res.error('Warehouse not found', 404);
    }

    res.success(warehouse, 'Warehouse deactivated successfully');
  } catch (error) {
    next(error);
  }
};

const assignDistributor = async (req, res, next) => {
  try {
    const { managerId } = req.body;

    // Check if user exists and is a distributor
    const user = await User.findById(managerId).populate('role');
    
    if (!user) {
      return res.error('User not found', 404);
    }

    if (user.role.code !== 'distributor') {
      return res.error('User must be a distributor', 400);
    }

    // Check if user already manages a warehouse
    const existingWarehouse = await Warehouse.findOne({ manager: managerId });
    if (existingWarehouse) {
      return res.error('User already manages a warehouse', 400);
    }

    const warehouse = await Warehouse.findByIdAndUpdate(
      req.params.id,
      { manager: managerId },
      { new: true }
    ).populate('manager', 'firstName lastName email');

    if (!warehouse) {
      return res.error('Warehouse not found', 404);
    }

    res.success(warehouse, 'Distributor assigned successfully');
  } catch (error) {
    next(error);
  }
};

const getWarehouseInventory = async (req, res, next) => {
  try {
    const Inventory = require('../models/Inventory');
    
    const inventory = await Inventory.find({ warehouse: req.params.id })
      .populate('product', 'sku name price')
      .sort({ quantity: -1 });

    res.success({ inventory });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWarehouse,
  listWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
  assignDistributor,
  getWarehouseInventory
};
