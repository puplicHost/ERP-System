const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()
const { Schema } = mongoose
const UserModel = require("../models/UserModel")
const RoleModel = require("../models/RoleModel")
const bcrypt = require('bcrypt');
const JWT = require("jsonwebtoken")
const generateTokens = require("../utils/genrateJWT")
const UserRoles = require("../utils/UserRoles");

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
    
    if (!isValidObjectId(id)) {
        return res.status(400).json({ status: "error", message: "Invalid user ID format" })
    }
    
    const User = await UserModel.findById(id).select("-Password -refreshTokens")
    
    if (!User) {
        return res.status(404).json({ status: "error", message: "User not found" })
    }
    
    res.status(200).json({
        status: "success",
        data: { User }
    })
}

// get current user data from JWT
const getUserData = async (req, res) => {
    const userId = req.decoded?.id

    if (!userId) {
        return res.status(401).json({
            status: "error",
            message: "Authentication required"
        })
    }

    const user = await UserModel.findById(userId).select("-Password -refreshTokens")

    if (!user) {
        return res.status(404).json({
            status: "error",
            message: "User not found"
        })
    }

    // جلب Role مع Permissions
    const userRole = await RoleModel.findOne({ name: user.Role }).populate("permissions", "name description")

    res.status(200).json({
        status: "success",
        message: "User data fetched successfully",
        data: {
            user: {
                id: user._id,
                FirstName: user.FirstName,
                lastName: user.lastName,
                email: user.email,
                Role: user.Role,
                avatar: user.avatar
            },
            role: userRole ? {
                name: userRole.name,
                description: userRole.description,
                permissions: userRole.permissions
            } : null,
            permissions: req.decoded?.permissions || []
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

    // جلب Role مع Permissions
    const userRole = await RoleModel.findOne({ name: newUSer.Role }).populate("permissions");
    const permissions = userRole ? userRole.permissions.map(p => p.name) : [];

    // Generate Access Token + Refresh Token
    const { accessToken, refreshToken } = await generateTokens({
        email: newUSer.email,
        id: newUSer._id,
        role: newUSer.Role,
        permissions
    })

    // Hash refresh token before saving
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)

    // Save refresh token to user
    newUSer.refreshTokens.push({ token: hashedRefreshToken })
    newUSer.token = accessToken

    await newUSer.save()

    res.status(201).json({
        status: "success",
        message: "User created successfully",
        data: {
            user: {
                id: newUSer._id,
                FirstName: newUSer.FirstName,
                lastName: newUSer.lastName,
                email: newUSer.email,
                Role: newUSer.Role,
                permissions
            },
            accessToken,
            refreshToken
        }
    })
}

// update user
const updateUser = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ status: "error", message: "Request body is missing." });
    }
    
    const id = req.params.id
    
    if (!isValidObjectId(id)) {
        return res.status(400).json({ status: "error", message: "Invalid user ID format" })
    }
    
    const { FirstName, lastName, email, Password, Role } = req.body

    if (Role) {
        const isValid = await validateRole(Role);
        if (!isValid) {
            return res.status(400).json({ status: "error", message: "Invalid Role" });
        }
    }
    
    // Check if file was uploaded to upgrade avatar
    const avatar = req.file ? req.file.filename : undefined

    // Prepare update object
    const updateData = { FirstName, lastName, email, Role }
    
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
    
    if (!updatedUser) {
        return res.status(404).json({ status: "error", message: "User not found" })
    }

    res.status(200).json({
        status: "success",
        message: "User updated successfully",
        data: { updatedUser }
    })
}

// delete user
const deleteuser = async (req, res) => {
    const id = req.params.id
    
    if (!isValidObjectId(id)) {
        return res.status(400).json({ status: "error", message: "Invalid user ID format" })
    }
    
    const deletedUser = await UserModel.findByIdAndDelete(id)
    
    if (!deletedUser) {
        return res.status(404).json({ status: "error", message: "User not found" })
    }

    res.status(200).json({
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

    // جلب Role مع Permissions
    const userRole = await RoleModel.findOne({ name: newUSer.Role }).populate("permissions");
    const permissions = userRole ? userRole.permissions.map(p => p.name) : [];

    // Generate Access Token + Refresh Token
    const { accessToken, refreshToken } = await generateTokens({
        email: newUSer.email,
        id: newUSer._id,
        role: newUSer.Role,
        permissions
    })

    // Hash refresh token before saving
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)

    // Save refresh token to user
    newUSer.refreshTokens.push({ token: hashedRefreshToken })
    newUSer.token = accessToken

    await newUSer.save()

    res.status(201).json({
        status: "success",
        message: "User registered successfully",
        data: {
            user: {
                id: newUSer._id,
                FirstName: newUSer.FirstName,
                lastName: newUSer.lastName,
                email: newUSer.email,
                Role: newUSer.Role,
                permissions
            },
            accessToken,
            refreshToken
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

    // التحقق من أن المستخدم نشط
    if (!user.isActive) {
        return res.status(403).json({
            status: "error",
            message: "Your account has been deactivated. Please contact administrator."
        })
    }

    const matchPassword = await bcrypt.compare(Password, user.Password)

    if (!matchPassword) {
        return res.status(400).json("you have wrong password")
    }

    // جلب Role مع Permissions
    const userRole = await RoleModel.findOne({ name: user.Role }).populate("permissions");
    const permissions = userRole ? userRole.permissions.map(p => p.name) : [];

    const { accessToken, refreshToken } = await generateTokens({
        email: user.email,
        id: user._id,
        role: user.Role,
        permissions
    })

    // Hash refresh token before saving
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)

    // Save refresh token to user
    user.refreshTokens.push({ token: hashedRefreshToken })
    await user.save()

    return res.status(200).json({
        status: "success",
        message: "Login successful",
        data: {
            user: {
                id: user._id,
                FirstName: user.FirstName,
                lastName: user.lastName,
                email: user.email,
                Role: user.Role,
                permissions
            },
            accessToken,
            refreshToken
        }
    })
}

// Refresh Token - إنشاء access token جديد
const refresh = async (req, res) => {
    const { refreshToken } = req.body

    if (!refreshToken) {
        return res.status(401).json({
            status: "error",
            message: "Refresh token is required"
        })
    }

    try {
        // Verify refresh token
        const decoded = JWT.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY)

        // Find user
        const user = await UserModel.findById(decoded.id)
        if (!user) {
            return res.status(403).json({
                status: "error",
                message: "Invalid refresh token"
            })
        }

        // Check if refresh token exists and is valid
        const tokenExists = user.refreshTokens.some(rt => bcrypt.compareSync(refreshToken, rt.token))
        if (!tokenExists) {
            return res.status(403).json({
                status: "error",
                message: "Refresh token is not valid"
            })
        }

        // جلب permissions المحدثة
        const userRole = await RoleModel.findOne({ name: user.Role }).populate("permissions");
        const permissions = userRole ? userRole.permissions.map(p => p.name) : [];

        // Generate new tokens
        const tokens = await generateTokens({
            email: user.email,
            id: user._id,
            role: user.Role,
            permissions
        })

        return res.status(200).json({
            status: "success",
            message: "Token refreshed successfully",
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }
        })
    } catch (err) {
        return res.status(403).json({
            status: "error",
            message: "Invalid or expired refresh token"
        })
    }
}

// Logout - حذف refresh token
const logout = async (req, res) => {
    const { refreshToken } = req.body
    const userId = req.decoded?.id

    if (!refreshToken || !userId) {
        return res.status(400).json({
            status: "error",
            message: "Refresh token is required"
        })
    }

    const user = await UserModel.findById(userId)
    if (!user) {
        return res.status(404).json({
            status: "error",
            message: "User not found"
        })
    }

    // Remove the specific refresh token
    user.refreshTokens = user.refreshTokens.filter(rt => !bcrypt.compareSync(refreshToken, rt.token))
    await user.save()

    return res.status(200).json({
        status: "success",
        message: "Logged out successfully"
    })
}

const asyncWrapper = require("../utils/asyncWrapper")
const { isValidObjectId } = require("../utils/validators")

module.exports = {
    getAllUsers: asyncWrapper(getAllUsers),
    getUser: asyncWrapper(getUser),
    getUserData: asyncWrapper(getUserData),
    register: asyncWrapper(register),
    login: asyncWrapper(login),
    refresh: asyncWrapper(refresh),
    logout: asyncWrapper(logout),
    createUser: asyncWrapper(createUser),
    updateUser: asyncWrapper(updateUser),
    deleteuser: asyncWrapper(deleteuser)
}