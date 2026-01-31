const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()
const { Schema } = mongoose
const UserModel = require("../models/UserModel")
const bcrypt = require('bcrypt');
const JWT = require("jsonwebtoken")
const generateJWT = require("../utils/genrateJWT")
<<<<<<< HEAD
const getAllUsers = async (req, res) => {
=======

// get all users
getAllUsers = async (req, res) => {
>>>>>>> 3a105592fc2d36cd83c5bff57ead7702b694cb40

    const Users = await UserModel.find()
    res.status(200).json({
        status: "success",
        data: {
            Users
        }
    })


}
<<<<<<< HEAD


const register = async (req, res) => {
    const { FirstName, lastName, email, Password } = req.body
=======
// get all users
getUser = async (req, res) => {
    const id = req.params.id
    const User = await UserModel.findById(id)
    res.status(200).json({
        status: "success",
        data: {
            User
        }
    })


}
// create user
createUser = async (req, res) => {
    const { FirstName, lastName, email, Password, Role } = req.body
    const avatar = req.file.filename

    // hashing password
    const hashedPassword = await bcrypt.hash(Password, 12)

    const newUSer = new UserModel({
        FirstName,
        lastName,
        email,
        Password: hashedPassword,
        Role,
        avatar
    })

    await newUSer.save()

    res.status(201).json({
        status: "success",
        data: {
            newUSer
        }
    })

}
// update user
updateUser = async (req, res) => {
    const { FirstName, lastName, email, Password, Role } = req.body
    const id = req.params.id
    const avatar = req.file.filename
    const hashedPassword = await bcrypt.hash(Password, 12)


    const updateUser = await UserModel.findByIdAndUpdate(id, {
        FirstName, lastName, email, Password: hashedPassword, Role,avatar

    }, {
        new: true,
        runValidators: true
    })






    res.status(201).json({
        status: "success",
        data: {
            updateUser
        }
    })

}

// delete user
deleteuser = async (req, res) => {

    const id = req.params.id

    const deleteuser = await UserModel.findByIdAndDelete(id)

    res.status(201).json({
        status: "success",
        message: "User has been deleted"

    })

}

// register
register = async (req, res) => {
    const { FirstName, lastName, email, Password, Role } = req.body

>>>>>>> 3a105592fc2d36cd83c5bff57ead7702b694cb40
    const oldUser = await UserModel.findOne({ email })

    if (oldUser) {
        return res.status(400).json("User already exists")
    }
    // hashing password
    const hashedPassword = await bcrypt.hash(Password, 12)

    const newUSer = new UserModel({
        FirstName,
        lastName,
        email,
<<<<<<< HEAD
        Password: hashedPassword
    })
    // jwt 
 const token = await generateJWT({
    email:newUSer.email,
    id:newUSer._id
 })


newUSer.token = token
=======
        Password: hashedPassword,
        Role,
     
    })
    // jwt 
    const token = await generateJWT({
        email: newUSer.email,
        id: newUSer._id
    })


    newUSer.token = token
>>>>>>> 3a105592fc2d36cd83c5bff57ead7702b694cb40



    await newUSer.save()

    res.status(201).json({
        status: "success",
        data: {
            newUSer
        }
    })

}

<<<<<<< HEAD

const login = async (req, res) => {
=======
// login
login = async (req, res) => {
>>>>>>> 3a105592fc2d36cd83c5bff57ead7702b694cb40
    const { email, Password } = req.body
    if (!email || !Password) {
        return res.status(400).json("email and password are required")
    }

    const user = await UserModel.findOne({ email })

    if (!user) {
        return res.status(400).json("user is don't exists")
    }
    const matchPassword = await bcrypt.compare(Password, user.Password)

    if (!matchPassword) {
        return res.status(400).json("you have wrong password")
    }
    if (user && matchPassword) {

<<<<<<< HEAD
         const token = await generateJWT({
    email:user.email,
    id:user._id
 })
        return res.status(200).json({token})
=======
        const token = await generateJWT({
            email: user.email,
            id: user._id
        })
        return res.status(200).json({ token })
>>>>>>> 3a105592fc2d36cd83c5bff57ead7702b694cb40

    }




}

module.exports = {
    getAllUsers,
<<<<<<< HEAD
    register,
    login
=======
    getUser,
    register,
    login,
    createUser,
    updateUser,
    deleteuser
>>>>>>> 3a105592fc2d36cd83c5bff57ead7702b694cb40

}