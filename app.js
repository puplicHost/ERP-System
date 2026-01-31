const express = require("express");
const app = express();
const dotenv = require("dotenv")
dotenv.config();
const port = process.env.PORT;

// CORS Configuration
const corsMiddleware = require("./config/corsConfig");
app.use(corsMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DatabaseConnection

const Db_Connection = require("./config/DBConfig")
Db_Connection()

// Routers 
const UsersRouter = require("./Routers/UsersRouter");
app.use("/api/users", UsersRouter)













app.listen(port,()=>{
    console.log("Server is running")
})







