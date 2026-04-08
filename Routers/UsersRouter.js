const express = require("express")
const router = express.Router();
const Controllers = require("../Controllers/UsersControllers")
const path = require("path")
const { checkPermission } = require("../middleware/checkPermission")
const Auth = require("../middleware/authToken")
const { loginLimiter } = require("../middleware/rateLimiter")
// multer
const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"))
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1]
    const filename = `${Date.now()}.${ext}`
    cb(null, filename)
  }
})
const upload = multer({ storage: storage })

router.route("/").get(Auth, checkPermission("READ_USER"), Controllers.getAllUsers)
router.route("/getUser/:id").get(Auth, checkPermission("READ_USER"), Controllers.getUser)
router.route("/createUser").post(Auth, checkPermission("CREATE_USER"), upload.single('avatar'), Controllers.createUser)
router.route("/updateUser/:id").patch(Auth, checkPermission("UPDATE_USER"), upload.single('avatar'), Controllers.updateUser)
router.route("/deleteuser/:id").delete(Auth, checkPermission("DELETE_USER"), Controllers.deleteuser)
// Auth
router.route("/login").post(loginLimiter, Controllers.login)
router.route("/register").post(upload.single('avatar'), Controllers.register)
router.route("/refresh").post(Controllers.refresh)
router.route("/logout").post(Auth, Controllers.logout)
router.route("/userdata").get(Auth, Controllers.getUserData)

module.exports = router;