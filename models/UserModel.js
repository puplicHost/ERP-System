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
<<<<<<< HEAD
    }
=======
    },
    Role:{
        type : String
    },
    avatar:{
        type : String,
        default : "uploads"
    }
    
>>>>>>> 3a105592fc2d36cd83c5bff57ead7702b694cb40
})

const UserModel = mongoose.model("User", UserSchema)





module.exports = UserModel;