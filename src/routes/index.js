const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const roleRoutes = require('./roles');
const permissionRoutes = require('./permissions');
const productRoutes = require('./products');
const warehouseRoutes = require('./warehouses');
const inventoryRoutes = require('./inventory');
const cartRoutes = require('./cart');
const orderRoutes = require('./orders');
const invoiceRoutes = require('./invoices');
const paymentRoutes = require('./payments');
const reportsRoutes = require('./reports');
const auditLogRoutes = require('./auditLogs');
const notificationRoutes = require('./notifications');

router.use('/auth', authRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/products', productRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/reports', reportsRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
