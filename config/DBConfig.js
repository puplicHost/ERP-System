const dotenv = require("dotenv")
dotenv.config()
const DB_URI = process.env.DB_URI;
const mongoose = require("mongoose")

const Db_Connection = async () => {

    try {
        await mongoose.connect(DB_URI)
        console.log("Db is Connect")
    }
    catch(err){

                console.log("Db is Connect Field")

    }


}

module.exports = Db_Connection;