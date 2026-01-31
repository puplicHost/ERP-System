const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()
const { Schema } = mongoose
const UserModel = require("../models/UserModel")
const bcrypt = require('bcrypt');
const JWT = require("jsonwebtoken")
const generateJWT = require("../utils/genrateJWT")

// get all users
const getAllUsers = async (req, res) => {
    const Users = await UserModel.find()
    res.status(200).json({
        status: "success",
        data: {
            Users
        }
    })
}

// get user by id
const getUser = async (req, res) => {
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
const createUser = async (req, res) => {
    const { FirstName, lastName, email, Password, Role } = req.body
    const avatar = req.file ? req.file.filename : null

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
const updateUser = async (req, res) => {
    const { FirstName, lastName, email, Password, Role } = req.body
    const id = req.params.id
    // Check if file was uploaded to upgrade avatar, otherwise keep old or null
    const avatar = req.file ? req.file.filename : undefined 
    
    // Prepare update object
    const updateData = {
        FirstName, lastName, email, Role
    }
    if (Password) {
        updateData.Password = await bcrypt.hash(Password, 12)
    }
    if (avatar) {
        updateData.avatar = avatar
    }

    const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    })

    res.status(201).json({
        status: "success",
        data: {
            updatedUser
        }
    })
}

// delete user
const deleteuser = async (req, res) => {
    const id = req.params.id
    await UserModel.findByIdAndDelete(id)

    res.status(201).json({
        status: "success",
        message: "User has been deleted"
    })
}

// register
const register = async (req, res) => {
    const { FirstName, lastName, email, Password, Role } = req.body

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
        Password: hashedPassword,
        Role
    })
    
    // jwt 
    const token = await generateJWT({
        email: newUSer.email,
        id: newUSer._id
    })

    newUSer.token = token

    await newUSer.save()

    res.status(201).json({
        status: "success",
        data: {
            newUSer
        }
    })
}

// login
const login = async (req, res) => {
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
    
    const token = await generateJWT({
        email: user.email,
        id: user._id
    })
    return res.status(200).json({ token })
}

module.exports = {
    getAllUsers,
    getUser,
    register,
    login,
    createUser,
    updateUser,
    deleteuser
}