import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import logger, { logSecurityEvent } from '../config/logger.js';

// Generate JWT Token with token version for revocation support
const generateToken = (userId, role, tokenVersion) => {
  return jwt.sign(
    { userId, role, tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '7d' }
  );
};

// Register User
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, organizationId } = req.body;

    // Validation
    if (!name || !email || !password || !organizationId) {
      return res.status(400).json({ error: 'Please provide name, email, password, and organizationId' });
    }

    // Verify organization exists and is active
    const Organization = mongoose.model('Organization');
    const organization = await Organization.findById(organizationId);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    if (!organization.active) {
      return res.status(403).json({ error: 'Organization is not active' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      logSecurityEvent('DUPLICATE_REGISTRATION_ATTEMPT', {
        email,
        ip: req.ip
      });
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Create new user - SECURITY: Force default role server-side, ignore client input
    // Elevated roles must be assigned through admin workflow
    const user = await User.create({
      name,
      email,
      password,
      role: 'dispatcher',
      phone,
      organizationId: organization._id,
    });

    // Generate token with version
    const token = generateToken(user._id, user.role, user.tokenVersion);

    logger.info('User registered', {
      userId: user._id,
      email: user.email,
      organizationId: organization._id,
      ip: req.ip
    });

    // ✅ SECURITY FIX: Set HTTPOnly cookie to prevent XSS token theft
    res.cookie('fleetflow_token', token, {
      httpOnly: true,     // Cannot be accessed by JavaScript (XSS protection)
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    // Return user data (without token and password)
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user and get password (normally not selected)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      logSecurityEvent('FAILED_LOGIN_ATTEMPT', {
        email,
        reason: 'User not found',
        ip: req.ip
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      logSecurityEvent('FAILED_LOGIN_ATTEMPT', {
        email,
        userId: user._id,
        reason: 'Invalid password',
        ip: req.ip
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.active) {
      logSecurityEvent('INACTIVE_USER_LOGIN_ATTEMPT', {
        email,
        userId: user._id,
        ip: req.ip
      });
      return res.status(403).json({ error: 'User account is not active' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token with version
    const token = generateToken(user._id, user.role, user.tokenVersion);

    logger.info('User logged in', {
      userId: user._id,
      email: user.email,
      organizationId: user.organizationId,
      ip: req.ip
    });

    // ✅ SECURITY FIX: Set HTTPOnly cookie to prevent XSS token theft
    res.cookie('fleetflow_token', token, {
      httpOnly: true,     // Cannot be accessed by JavaScript (XSS protection)
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    // Return user data (without token and password)
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    logger.error('Login error', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

// Get User Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
        address: user.address,
        notificationSettings: user.notificationSettings,
        workspaceSettings: user.workspaceSettings,
        active: user.active,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update User Profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, address, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, phone, bio, address, email },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
        address: user.address,
        notificationSettings: user.notificationSettings,
        workspaceSettings: user.workspaceSettings,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Update User Settings (Notifications, Workspace)
export const updateSettings = async (req, res) => {
  try {
    const { notificationSettings, workspaceSettings } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (notificationSettings) user.notificationSettings = { ...user.notificationSettings, ...notificationSettings };
    if (workspaceSettings) user.workspaceSettings = { ...user.workspaceSettings, ...workspaceSettings };

    await user.save();

    res.status(200).json({
      message: 'Settings updated successfully',
      settings: {
        notificationSettings: user.notificationSettings,
        workspaceSettings: user.workspaceSettings,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export User Data
export const exportData = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // In a real app, this would include all their related data (trips, logs, etc.)
    // For now, just user info
    const data = {
      user: user.toJSON(),
      timestamp: new Date(),
      info: 'FleetFlow Personal Data Export'
    };

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete/Deactivate Account (User self-service)
export const deleteAccount = async (req, res) => {
  try {
    // SECURITY: Increment token version to invalidate all existing tokens
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { 
        active: false,
        $inc: { tokenVersion: 1 }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Account deactivated successfully. All sessions invalidated.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Please provide old and new password' });
    }

    const user = await User.findById(req.user.userId).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify old password
    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Old password is incorrect' });
    }

    // Update password and increment token version to invalidate all existing tokens
    user.password = newPassword;
    user.tokenVersion += 1;
    await user.save();

    res.status(200).json({ 
      message: 'Password changed successfully. All sessions invalidated. Please login again.' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ SECURITY FIX: Logout endpoint to clear HTTPOnly cookie
export const logout = async (req, res) => {
  try {
    // Clear the HTTPOnly cookie
    res.clearCookie('fleetflow_token', { path: '/' });

    logger.info('User logged out', {
      userId: req.user.userId,
      email: req.user.email,
      ip: req.ip
    });

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    logger.error('Logout error', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

// Get All Users (Admin/Manager only)
export const getAllUsers = async (req, res) => {
  try {
    // ✅ SECURITY FIX: Add pagination to prevent data dump attacks
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const users = await User.find({ active: true })
      .select('-password')
      .limit(limit)
      .skip(skip);

    const total = await User.countDocuments({ active: true });
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({ 
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Deactivate User (Admin/Manager only)
export const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // SECURITY: Increment token version to invalidate all user's tokens
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        active: false,
        $inc: { tokenVersion: 1 }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deactivated successfully. All sessions invalidated.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
