const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Validation rules
const createOrderValidation = [
  body('shippingAddress.fullName').notEmpty().withMessage('Full name is required'),
  body('shippingAddress.phone').notEmpty().withMessage('Phone is required'),
  body('shippingAddress.address').notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required')
];

// Routes
router.post('/', authenticate, createOrderValidation, orderController.createOrder);
router.get('/', authenticate, orderController.listOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.put('/:id/cancel', authenticate, orderController.cancelOrder);

// Distributor operations
router.put('/:id/accept', authenticate, orderController.acceptOrder);
router.put('/:id/reject', authenticate, orderController.rejectOrder);
router.put('/:id/prepare', authenticate, orderController.prepareOrder);
router.put('/:id/ship', authenticate, orderController.shipOrder);
router.put('/:id/deliver', authenticate, orderController.confirmDelivery);

module.exports = router;
