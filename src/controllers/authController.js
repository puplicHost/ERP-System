const User = require('../models/User');
const Role = require('../models/Role');
const { generateAccessToken, generateRefreshToken } = require('../config/jwt');

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, roleCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.error('Email already exists', 409);
    }

    // Find role by code
    const role = await Role.findOne({ code: roleCode });
    if (!role) {
      return res.error('Invalid role', 400);
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      role: role._id,
      gender: req.body.gender || null
    });

    // Populate role for response
    await user.populate('role');

    // Generate tokens
    const permissions = role.permissions.map(p => p.toString());
    const accessToken = generateAccessToken(user._id, permissions);
    const refreshToken = generateRefreshToken(user._id);

    res.success({
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: {
          _id: user.role._id,
          name: user.role.name,
          code: user.role.code
        }
      },
      accessToken,
      refreshToken
    }, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and populate role
    const user = await User.findOne({ email }).populate('role');
    if (!user) {
      return res.error('Invalid credentials', 401);
    }

    // Check if account is active
    if (!user.isActive) {
      return res.error('Account is deactivated', 403);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.error('Invalid credentials', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const permissions = user.role.permissions.map(p => p.toString());
    const accessToken = generateAccessToken(user._id, permissions);
    const refreshToken = generateRefreshToken(user._id);

    res.success({
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: {
          _id: user.role._id,
          name: user.role.name,
          code: user.role.code
        }
      }
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

const getUserData = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
      .populate('role')
      .populate('role.permissions');

    if (!user) {
      return res.error('User not found', 404);
    }

    res.success({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      gender: user.gender,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getUserData
};
