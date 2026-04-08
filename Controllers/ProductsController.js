const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()
const { Schema } = mongoose
const ProductsModel = require("../models/ProductsModel")
const { isValidObjectId, validateFileUpload } = require("../utils/validators")

// get all Products
getAllProducts = async (req, res) => {
    const products = await ProductsModel.find()
    res.status(200).json({
        status: "success",
        data: {
            products
        }
    })

}
// get product by id
getProduct = async (req, res) => {
    const id = req.params.id
    
    if (!isValidObjectId(id)) {
        return res.status(400).json({ status: "error", message: "Invalid product ID format" })
    }
    
    const product = await ProductsModel.findById(id).populate('warehouse', 'name address')
    
    if (!product) {
        return res.status(404).json({ status: "error", message: "Product not found" })
    }
    
    res.status(200).json({
        status: "success",
        data: { product }
    })
}

// create product
createProduct = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ status: "error", message: "Request body is missing." });
    }
    
    // Validate file upload
    const fileValidation = validateFileUpload(req.file, true);
    if (!fileValidation.valid) {
        return res.status(400).json({ status: "error", message: fileValidation.error });
    }
    
    const { name, description, price, category, warehouse } = req.body
    
    // Validate warehouse ID if provided
    if (warehouse && !isValidObjectId(warehouse)) {
        return res.status(400).json({ status: "error", message: "Invalid warehouse ID format" });
    }
    
    const images = req.file.filename

    const newProduct = new ProductsModel({
        name,
        description,
        price,
        category,
        warehouse,
        images
    })

    await newProduct.save()

    res.status(201).json({
        status: "success",
        message: "Product created successfully",
        data: { product: newProduct }
    })
}

// update product
updateProduct = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ status: "error", message: "Request body is missing." });
    }
    
    const id = req.params.id
    
    if (!isValidObjectId(id)) {
        return res.status(400).json({ status: "error", message: "Invalid product ID format" });
    }
    
    // Validate file upload if provided (optional for update)
    if (req.file) {
        const fileValidation = validateFileUpload(req.file, false);
        if (!fileValidation.valid) {
            return res.status(400).json({ status: "error", message: fileValidation.error });
        }
    }
    
    const { name, description, price, category, warehouse } = req.body
    
    // Validate warehouse ID if provided
    if (warehouse && !isValidObjectId(warehouse)) {
        return res.status(400).json({ status: "error", message: "Invalid warehouse ID format" });
    }
    
    const updateData = { name, description, price, category, warehouse }
    
    // Only update images if file was uploaded
    if (req.file) {
        updateData.images = req.file.filename
    }

    const updatedProduct = await ProductsModel.findByIdAndUpdate(id, updateData, { new: true })
    
    if (!updatedProduct) {
        return res.status(404).json({ status: "error", message: "Product not found" })
    }

    res.status(200).json({
        status: "success",
        message: "Product updated successfully",
        data: { product: updatedProduct }
    })
}

// delete product
deleteProducts = async (req, res) => {
    const id = req.params.id
    
    if (!isValidObjectId(id)) {
        return res.status(400).json({ status: "error", message: "Invalid product ID format" })
    }

    const deletedProduct = await ProductsModel.findByIdAndDelete(id)
    
    if (!deletedProduct) {
        return res.status(404).json({ status: "error", message: "Product not found" })
    }

    res.status(200).json({
        status: "success",
        message: "Product has been deleted"
    })
}

const asyncWrapper = require("../utils/asyncWrapper")

module.exports = {
    getAllProducts: asyncWrapper(getAllProducts),
    getProduct: asyncWrapper(getProduct),
    createProduct: asyncWrapper(createProduct),
    updateProduct: asyncWrapper(updateProduct),
    deleteProducts: asyncWrapper(deleteProducts)
}