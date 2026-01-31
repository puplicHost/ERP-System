const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()
const { Schema } = mongoose
const ProductsModel = require("../models/ProductsModel")

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
// get all users
getProduct = async (req, res) => {
    const id = req.params.id
    const product = await ProductsModel.findById(id)
    res.status(200).json({
        status: "success",
        data: {
            product
        }
    })


}
// create user
createProduct = async (req, res) => {
    const { name, description, price, category, warehouse } = req.body
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
        data: {
            newProduct
        }
    })

}
// update user
updateProduct= async (req, res) => {
    const { name, description, price, category, warehouse } = req.body
    const id = req.params.id
    const images = req.file.filename



    const updateProduct= await ProductsModel.findByIdAndUpdate(id, {
        name, description, price, category, warehouse,images

    }, {
        new: true,

    })






    res.status(201).json({
        status: "success",
        data: {
            updateProduct
        }
    })

}

// delete user
deleteProducts = async (req, res) => {

    const id = req.params.id

    const deleteProducts = await ProductsModel.findByIdAndDelete(id)

    res.status(201).json({
        status: "success",
        message: "product has been deleted"

    })

}


module.exports = {
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProducts

}