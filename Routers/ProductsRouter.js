const express = require("express")
const router = express.Router();
const Controllers = require("../Controllers/ProductsController")
const path = require("path")
const Auth = require("../middleware/authToken")
const UserRoles = require("../utils/UserRoles")

// multer
const multer  = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,path.join(__dirname, "../uploads/Products"))
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1]
    const filename = `${Date.now()}.${ext}`
    cb(null,filename )
  }
})
const upload = multer({ storage: storage })

router.route("/").get(Auth,AllowedTo(UserRoles.SuperAdmin),Controllers.getAllProducts)
router.route("/getProduct/:id").get(Auth,AllowedTo(UserRoles.SuperAdmin),Controllers.getProduct)
router.route("/createProduct").post(Auth,upload.single('images'),AllowedTo(UserRoles.SuperAdmin),Controllers.createProduct)
router.route("/updateProduct/:id").patch(Auth,upload.single('images'),AllowedTo(UserRoles.SuperAdmin),Controllers.updateProduct)
router.route("/deleteProducts/:id").delete(Auth,AllowedTo(UserRoles.SuperAdmin),Controllers.deleteProducts)


module.exports = router;