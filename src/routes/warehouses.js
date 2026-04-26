const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const warehouseController = require('../controllers/warehouseController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Validation rules
const createWarehouseValidation = [
  body('code').notEmpty().withMessage('Warehouse code is required'),
  body('name').notEmpty().withMessage('Warehouse name is required'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.country').notEmpty().withMessage('Country is required')
];

// Routes
router.post('/', authenticate, authorize('warehouse:create'), createWarehouseValidation, warehouseController.createWarehouse);
router.get('/', authenticate, authorize('warehouse:list'), warehouseController.listWarehouses);
router.get('/:id', authenticate, authorize('warehouse:read'), warehouseController.getWarehouseById);
router.get('/:id/inventory', authenticate, authorize('warehouse:read'), warehouseController.getWarehouseInventory);
router.put('/:id', authenticate, authorize('warehouse:update'), warehouseController.updateWarehouse);
router.put('/:id/assign', authenticate, authorize('warehouse:assign'), warehouseController.assignDistributor);
router.delete('/:id', authenticate, authorize('warehouse:delete'), warehouseController.deleteWarehouse);

module.exports = router;
