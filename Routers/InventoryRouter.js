const express = require('express');
const router = express.Router();
const Controllers = require('../Controllers/InventoryController');
const Auth = require('../middleware/authToken');
const { checkPermission } = require('../middleware/checkPermission');

// Inventory endpoints with permission-based authorization
router.route('/').get(Auth, checkPermission('MANAGE_INVENTORY'), Controllers.getAllInventory);
router.route('/get/:id').get(Auth, checkPermission('MANAGE_INVENTORY'), Controllers.getInventoryItem);
router.route('/create').post(Auth, checkPermission('MANAGE_INVENTORY'), Controllers.createOrUpdateInventory);
router.route('/adjust').post(Auth, checkPermission('MANAGE_INVENTORY'), Controllers.adjustInventory);
router.route('/delete/:id').delete(Auth, checkPermission('MANAGE_INVENTORY'), Controllers.deleteInventory);

module.exports = router;
