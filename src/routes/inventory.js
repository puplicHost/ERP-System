const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const inventoryController = require('../controllers/inventoryController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Validation rules
const adjustInventoryValidation = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('warehouseId').notEmpty().withMessage('Warehouse ID is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number')
];

// Routes
router.post('/adjust', authenticate, authorize('inventory:update'), adjustInventoryValidation, inventoryController.adjustInventory);
router.get('/low-stock', authenticate, authorize('inventory:read'), inventoryController.getLowStock);
router.post('/transfer', authenticate, authorize('inventory:transfer'), adjustInventoryValidation, inventoryController.transferStock);

module.exports = router;
