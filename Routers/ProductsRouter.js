const express = require("express")
const router = express.Router();
const Controllers = require("../Controllers/ProductsController")
const path = require("path")


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

router.route("/").get(Controllers.getAllProducts)
router.route("/getProduct/:id").get(Controllers.getProduct)
router.route("/createProduct").post(upload.single('images'),Controllers.createProduct)
router.route("/updateProduct/:id").patch(upload.single('images'),Controllers.updateProduct)
router.route("/deleteProducts/:id").delete(Controllers.deleteProducts)


module.exports = router;