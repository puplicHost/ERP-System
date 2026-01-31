const express = require("express")
const router = express.Router();
const Controllers = require("../Controllers/UsersControllers")
<<<<<<< HEAD
const Auth = require("../middleware/authToken")

router.route("/").get(Auth,Controllers.getAllUsers)
router.route("/register").post(Controllers.register)
router.route("/login").post(Controllers.login)
=======
const path = require("path")

const Auth = require("../middleware/authToken")
// multer
const multer  = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,path.join(__dirname, "../uploads"))
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1]
    const filename = `${Date.now()}.${ext}`
    cb(null,filename )
  }
})
const upload = multer({ storage: storage })

router.route("/").get(Controllers.getAllUsers)
router.route("/getUser/:id").get(Controllers.getUser)
router.route("/createUser").post(upload.single('avatar'),Controllers.createUser)
router.route("/updateUser/:id").patch(upload.single('avatar'),Controllers.updateUser)
router.route("/deleteuser/:id").delete(Controllers.deleteuser)
// Auth
router.route("/login").post(Controllers.login)
router.route("/register").post(upload.single('avatar'),Controllers.register)
>>>>>>> 3a105592fc2d36cd83c5bff57ead7702b694cb40

module.exports = router;