const express = require("express");
const router = express.Router();
const permissionsController = require("../Controllers/PermissionsController");
const Auth = require("../middleware/authToken");
const AllowedTo = require("../middleware/AllowedTo");
const UserRoles = require("../utils/UserRoles");

router.route("/")
    .get(Auth, AllowedTo(UserRoles.SuperAdmin), permissionsController.getAllPermissions)
    .post(Auth, AllowedTo(UserRoles.SuperAdmin), permissionsController.createPermission);

router.route("/:id")
    .delete(Auth, AllowedTo(UserRoles.SuperAdmin), permissionsController.deletePermission);

module.exports = router;
