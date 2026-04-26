const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const authenticate = require('../middleware/auth');

// Validation rules
const recordPaymentValidation = [
  body('invoiceId').notEmpty().withMessage('Invoice ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('paymentMethod').isIn(['cash', 'card', 'bank_transfer', 'check', 'online']).withMessage('Invalid payment method')
];

// Routes
router.post('/record', authenticate, recordPaymentValidation, paymentController.recordPayment);
router.get('/', authenticate, paymentController.listPayments);
router.get('/:id', authenticate, paymentController.getPaymentById);
router.put('/:id/refund', authenticate, paymentController.refundPayment);

module.exports = router;
