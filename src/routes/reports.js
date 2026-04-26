const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Routes
router.get('/sales', authenticate, authorize('report:read'), reportsController.getSalesReport);
router.get('/stock', authenticate, authorize('report:read'), reportsController.getStockReport);
router.get('/profit', authenticate, authorize('report:read'), reportsController.getProfitReport);
router.get('/dashboard', authenticate, authorize('report:read'), reportsController.getDashboardStats);

module.exports = router;
