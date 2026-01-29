const express = require("express");
const app = express();
const dotenv = require("dotenv")
dotenv.config();
const port = process.env.PORT;
app.use(express.json());

// DatabaseConnection

const Db_Connection = require("./config/DBConfig")
Db_Connection()

// Routers 
const UsersRouter = require("./Routers/UsersRouter");
const { json } = require("body-parser");
app.use("/api/users", UsersRouter)













app.listen(port,()=>{
    console.log("Server is running")
})







