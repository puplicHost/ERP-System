const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const invoiceController = require('../controllers/invoiceController');
const authenticate = require('../middleware/auth');

// Validation rules
const generateInvoiceValidation = [
  body('orderId').notEmpty().withMessage('Order ID is required')
];

// Routes
router.post('/generate', authenticate, generateInvoiceValidation, invoiceController.generateInvoice);
router.get('/', authenticate, invoiceController.listInvoices);
router.get('/:id', authenticate, invoiceController.getInvoiceById);
router.put('/:id/mark-paid', authenticate, invoiceController.markAsPaid);

module.exports = router;
