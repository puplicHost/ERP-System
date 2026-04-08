const express = require("express");
const router = express.Router();
const rolesController = require("../Controllers/RolesControllers");
const Auth = require("../middleware/authToken");
const { checkPermission } = require("../middleware/checkPermission");
const { getPaginationParams } = require("../utils/pagination");

// Role management with permission-based authorization
router.route("/")
    .get(Auth, checkPermission("READ_ROLE"), getPaginationParams, rolesController.getAllRoles)
    .post(Auth, checkPermission("CREATE_ROLE"), rolesController.createRole);

router.route("/:id")
    .delete(Auth, checkPermission("DELETE_ROLE"), rolesController.deleteRole);

router.route("/:roleId/permissions")
    .post(Auth, checkPermission("UPDATE_ROLE"), rolesController.assignPermissions);

module.exports = router;
