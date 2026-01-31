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
const productsRouter = require("./Routers/ProductsRouter");
const { json } = require("body-parser");
app.use("/api/users", UsersRouter)
app.use("/api/products", productsRouter)














app.listen(port,()=>{
    console.log("Server is running")
})







