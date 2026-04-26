const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Validation rules
const createProductValidation = [
  body('sku').notEmpty().withMessage('SKU is required'),
  body('name').notEmpty().withMessage('Product name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('costPrice').isNumeric().withMessage('Cost price must be a number')
];

// Routes
router.post('/', authenticate, authorize('product:create'), createProductValidation, productController.createProduct);
router.get('/', authenticate, authorize('product:list'), productController.listProducts);
router.get('/search', authenticate, authorize('product:list'), productController.searchProducts);
router.get('/:id', authenticate, authorize('product:read'), productController.getProductById);
router.get('/:id/inventory', authenticate, authorize('product:read'), productController.getProductInventory);
router.put('/:id', authenticate, authorize('product:update'), productController.updateProduct);
router.delete('/:id', authenticate, authorize('product:delete'), productController.deleteProduct);

module.exports = router;
