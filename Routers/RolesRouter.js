const express = require("express");
const router = express.Router();
const rolesController = require("../Controllers/RolesControllers");
const Auth = require("../middleware/authToken");
const AllowedTo = require("../middleware/AllowedTo");
const UserRoles = require("../utils/UserRoles");

// Only Super Admin can manage roles
router.route("/")
    .get(Auth, AllowedTo(UserRoles.SuperAdmin), rolesController.getAllRoles)
    .post(Auth, AllowedTo(UserRoles.SuperAdmin), rolesController.createRole);

router.route("/:id")
    .delete(Auth, AllowedTo(UserRoles.SuperAdmin), rolesController.deleteRole);

router.route("/:roleId/permissions")
    .post(Auth, AllowedTo(UserRoles.SuperAdmin), rolesController.assignPermissions);

module.exports = router;
