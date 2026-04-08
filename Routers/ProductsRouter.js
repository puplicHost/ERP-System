const express = require("express")
const router = express.Router();
const Controllers = require("../Controllers/ProductsController")
const path = require("path")
const Auth = require("../middleware/authToken")
const { checkPermission } = require("../middleware/checkPermission")

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

router.route("/").get(Auth, checkPermission("READ_PRODUCT"), Controllers.getAllProducts)
router.route("/getProduct/:id").get(Auth, checkPermission("READ_PRODUCT"), Controllers.getProduct)
router.route("/createProduct").post(Auth, upload.single('images'), checkPermission("CREATE_PRODUCT"), Controllers.createProduct)
router.route("/updateProduct/:id").patch(Auth, upload.single('images'), checkPermission("UPDATE_PRODUCT"), Controllers.updateProduct)
router.route("/deleteProducts/:id").delete(Auth, checkPermission("DELETE_PRODUCT"), Controllers.deleteProducts)


module.exports = router;