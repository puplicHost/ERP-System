const express = require("express")
const router = express.Router();
const Controllers = require("../Controllers/UsersControllers")
const Auth = require("../middleware/authToken")

router.route("/").get(Auth,Controllers.getAllUsers)
router.route("/register").post(Controllers.register)
router.route("/login").post(Controllers.login)

module.exports = router;