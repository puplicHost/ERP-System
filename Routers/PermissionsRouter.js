const express = require("express");
const router = express.Router();
const permissionsController = require("../Controllers/PermissionsController");
const Auth = require("../middleware/authToken");
const { checkPermission } = require("../middleware/checkPermission");

router.route("/")
    .get(Auth, checkPermission("READ_PERMISSION"), permissionsController.getAllPermissions)
    .post(Auth, checkPermission("CREATE_PERMISSION"), permissionsController.createPermission);

router.route("/:id")
    .delete(Auth, checkPermission("DELETE_PERMISSION"), permissionsController.deletePermission);

module.exports = router;
