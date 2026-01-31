const mongoose = require("mongoose");
const { Schema } = mongoose
const validator  = require("validator")

const UserSchema = new Schema({

    FirstName: {
        type: String,
        required: true,

    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate :[validator.isEmail,"must be an Email"]
        
    },
    Password: {
        type: String,
        required: true
    },
    token : {
        type: String
    },
    Role:{
        type : String
    },
    avatar:{
        type : String,
        default : "uploads"
    }
    
})

const UserModel = mongoose.model("User", UserSchema)





module.exports = UserModel;