const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const roleRoutes = require('./roles');
const permissionRoutes = require('./permissions');
const productRoutes = require('./products');
const warehouseRoutes = require('./warehouses');
const inventoryRoutes = require('./inventory');

router.use('/auth', authRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/products', productRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/inventory', inventoryRoutes);

module.exports = router;
