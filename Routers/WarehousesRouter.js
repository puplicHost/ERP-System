const express = require('express');
const router = express.Router();
const Controllers = require('../Controllers/WarehousesController');
const Auth = require('../middleware/authToken');
const AllowedTo = require('../middleware/AllowedTo');
const UserRoles = require('../utils/UserRoles');

router.route('/').get(Auth, AllowedTo(UserRoles.SuperAdmin), Controllers.getAllWarehouses);
router.route('/get/:id').get(Auth, AllowedTo(UserRoles.SuperAdmin), Controllers.getWarehouse);
router.route('/create').post(Auth, AllowedTo(UserRoles.SuperAdmin), Controllers.createWarehouse);
router.route('/update/:id').patch(Auth, AllowedTo(UserRoles.SuperAdmin), Controllers.updateWarehouse);
router.route('/delete/:id').delete(Auth, AllowedTo(UserRoles.SuperAdmin), Controllers.deleteWarehouse);
router.route('/assign/:id').post(Auth, AllowedTo(UserRoles.SuperAdmin), Controllers.assignWarehouse);

module.exports = router;
