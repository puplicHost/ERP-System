const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const cartController = require('../controllers/cartController');
const authenticate = require('../middleware/auth');

// Validation rules
const addToCartValidation = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

const updateCartItemValidation = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

// Routes
router.get('/', authenticate, cartController.getCart);
router.post('/add', authenticate, addToCartValidation, cartController.addToCart);
router.put('/update', authenticate, updateCartItemValidation, cartController.updateCartItem);
router.delete('/:productId', authenticate, cartController.removeFromCart);
router.delete('/', authenticate, cartController.clearCart);

module.exports = router;
