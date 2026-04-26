const User = require('../models/User');
const Role = require('../models/Role');
const RefreshToken = require('../models/RefreshToken');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');

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
    const refreshTokenValue = generateRefreshToken(user._id);

    // Save refresh token to database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await RefreshToken.create({
      token: refreshTokenValue,
      user: user._id,
      expiresAt
    });

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
      refreshToken: refreshTokenValue
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
    const refreshTokenValue = generateRefreshToken(user._id);

    // Save refresh token to database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await RefreshToken.create({
      token: refreshTokenValue,
      user: user._id,
      expiresAt
    });

    res.success({
      accessToken,
      refreshToken: refreshTokenValue,
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

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.error('Refresh token is required', 400);
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find refresh token in database
    const tokenRecord = await RefreshToken.findOne({ user: decoded.userId });
    
    if (!tokenRecord) {
      return res.error('Invalid refresh token', 401);
    }

    // Verify token matches
    if (!tokenRecord.verifyToken(refreshToken)) {
      return res.error('Invalid refresh token', 401);
    }

    // Check if token is revoked
    if (tokenRecord.isRevoked) {
      return res.error('Refresh token has been revoked', 401);
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      return res.error('Refresh token expired', 401);
    }

    // Find user
    const user = await User.findById(decoded.userId).populate('role');
    
    if (!user || !user.isActive) {
      return res.error('User not found or inactive', 401);
    }

    // Generate new access token
    const permissions = user.role.permissions.map(p => p.toString());
    const newAccessToken = generateAccessToken(user._id, permissions);

    res.success({
      accessToken: newAccessToken,
      expiresIn: 900 // 15 minutes in seconds
    }, 'Token refreshed successfully');
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.error('Refresh token expired', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return res.error('Invalid refresh token', 401);
    }
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.error('Refresh token is required', 400);
    }

    // Find and revoke refresh token
    const tokenRecord = await RefreshToken.findOne({ user: req.userId });
    
    if (tokenRecord && tokenRecord.verifyToken(refreshToken)) {
      tokenRecord.isRevoked = true;
      await tokenRecord.save();
    }

    res.success(null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getUserData,
  refreshToken,
  logout
};
