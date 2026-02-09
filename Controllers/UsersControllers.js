const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()
const { Schema } = mongoose
const UserModel = require("../models/UserModel")
const RoleModel = require("../models/RoleModel") // Added RoleModel
const bcrypt = require('bcrypt');
const JWT = require("jsonwebtoken")
const generateJWT = require("../utils/genrateJWT")
const UserRoles = require("../utils/UserRoles"); // Ensure UserRoles is available

const validateRole = async (roleName) => {
    if (!roleName) return true; // Let default handle it or it's optional
    const staticRoles = Object.values(UserRoles);
    if (staticRoles.includes(roleName)) return true;
    const roleExists = await RoleModel.findOne({ name: roleName });
    return !!roleExists;
};

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
    if (!req.body) {
        return res.status(400).json({ status: "error", message: "Request body is missing." });
    }
    const { FirstName, lastName, email, Password, Role } = req.body

    if (Role) {
        const isValid = await validateRole(Role);
        if (!isValid) {
            return res.status(400).json({ status: "error", message: "Invalid Role" });
        }
    }
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
    if (!req.body) {
        return res.status(400).json({ status: "error", message: "Request body is missing." });
    }
    const { FirstName, lastName, email, Password, Role } = req.body

    if (Role) {
        const isValid = await validateRole(Role);
        if (!isValid) {
            return res.status(400).json({ status: "error", message: "Invalid Role" });
        }
    }
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
    console.log("Register Request Headers:", req.headers);
    console.log("Register Request Body:", req.body);
    console.log("Register Request File:", req.file);

    const { FirstName, lastName, email, Password, Role } = req.body || {};

    if (Role) {
        const isValid = await validateRole(Role);
        if (!isValid) {
            return res.status(400).json({ status: "error", message: "Invalid Role" });
        }
    }

    if (!req.body) {
        return res.status(400).json({ status: "error", message: "Request body is missing. Check Content-Type header." });
    }


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
        id: newUSer._id,
        role: newUSer.Role,
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
    if (!req.body) {
        return res.status(400).json({ status: "error", message: "Request body is missing. Check Content-Type header." });
    }
    const { email, Password, Role } = req.body
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
        id: user._id,
        role: user.Role,
    })
    return res.status(200).json({ token })
}

const asyncWrapper = require("../utils/asyncWrapper")

module.exports = {
    getAllUsers: asyncWrapper(getAllUsers),
    getUser: asyncWrapper(getUser),
    register: asyncWrapper(register),
    login: asyncWrapper(login),
    createUser: asyncWrapper(createUser),
    updateUser: asyncWrapper(updateUser),
    deleteuser: asyncWrapper(deleteuser)
}