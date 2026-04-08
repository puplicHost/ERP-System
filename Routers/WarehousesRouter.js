const express = require('express');
const router = express.Router();
const Controllers = require('../Controllers/WarehousesController');
const Auth = require('../middleware/authToken');
const { checkPermission } = require('../middleware/checkPermission');

router.route('/').get(Auth, checkPermission('READ_WAREHOUSE'), Controllers.getAllWarehouses);
router.route('/get/:id').get(Auth, checkPermission('READ_WAREHOUSE'), Controllers.getWarehouse);
router.route('/create').post(Auth, checkPermission('CREATE_WAREHOUSE'), Controllers.createWarehouse);
router.route('/update/:id').patch(Auth, checkPermission('UPDATE_WAREHOUSE'), Controllers.updateWarehouse);
router.route('/delete/:id').delete(Auth, checkPermission('DELETE_WAREHOUSE'), Controllers.deleteWarehouse);
router.route('/assign/:id').post(Auth, checkPermission('UPDATE_WAREHOUSE'), Controllers.assignWarehouse);

module.exports = router;
