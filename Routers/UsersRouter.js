const express = require("express")
const router = express.Router();
const Controllers = require("../Controllers/UsersControllers")
const path = require("path")
const AllowedTo = require("../middleware/AllowedTo")
const Auth = require("../middleware/authToken")
const UserRoles = require("../utils/UserRoles")
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

router.route("/").get(Auth, AllowedTo(UserRoles.SuperAdmin), Controllers.getAllUsers)
router.route("/getUser/:id").get(Auth,AllowedTo(UserRoles.SuperAdmin), Controllers.getUser)
router.route("/createUser").post(Auth,AllowedTo(UserRoles.SuperAdmin), upload.single('avatar'), Controllers.createUser)
router.route("/updateUser/:id").patch(Auth,AllowedTo(UserRoles.SuperAdmin), upload.single('avatar'), Controllers.updateUser)
router.route("/deleteuser/:id").delete(Auth,AllowedTo(UserRoles.SuperAdmin), Controllers.deleteuser)
// Auth
router.route("/login").post(Controllers.login)
router.route("/register").post(upload.single('avatar'), Controllers.register)

module.exports = router;