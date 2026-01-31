const mongoose = require("mongoose");
const { Schema } = mongoose

const ProductsSchema = new Schema({

    name: {
        type: String,
        required: true,

    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,



    },
    category: {
        type: String,
        required: true
    },
    warehouse: {
        type: Number,
        required: true
    },
    images:{
                type: String
    }

})

const ProductsModel = mongoose.model("Products", ProductsSchema)





module.exports = ProductsModel;