const express = require('express');
const router = express.Router();
const Controllers = require('../Controllers/InventoryController');
const Auth = require('../middleware/authToken');
const AllowedTo = require('../middleware/AllowedTo');
const UserRoles = require('../utils/UserRoles');

// Inventory endpoints: allow SuperAdmin and Distributor to manage inventory
router.route('/').get(Auth, AllowedTo(UserRoles.SuperAdmin), Controllers.getAllInventory);
router.route('/get/:id').get(Auth, AllowedTo(UserRoles.SuperAdmin), Controllers.getInventoryItem);
router.route('/create').post(Auth, AllowedTo(UserRoles.SuperAdmin, UserRoles.Distributor), Controllers.createOrUpdateInventory);
router.route('/adjust').post(Auth, AllowedTo(UserRoles.SuperAdmin, UserRoles.Distributor), Controllers.adjustInventory);
router.route('/delete/:id').delete(Auth, AllowedTo(UserRoles.SuperAdmin), Controllers.deleteInventory);

module.exports = router;
