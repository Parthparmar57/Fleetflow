import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify JWT Token with token version check
export const authenticate = async (req, res, next) => {
  try {
    // ✅ SECURITY FIX: Check HTTPOnly cookie first (preferred), fall back to Authorization header
    let token = req.cookies?.fleetflow_token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // SECURITY: Verify token version to support revocation
    // Check if user exists and token version matches
    const user = await User.findById(decoded.userId).select('tokenVersion active organizationId role');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    if (!user.active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }
    
    // Check if token version matches (supports logout/password change invalidation)
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ error: 'Token has been revoked. Please login again.' });
    }
    
    // SECURITY: Include organizationId for tenant scoping
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      tokenVersion: decoded.tokenVersion,
      organizationId: user.organizationId,  // CRITICAL for IDOR prevention
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Authorize based on user roles
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied. Insufficient permissions.',
        requiredRoles: allowedRoles,
        userRole: req.user.role,
      });
    }

    next();
  };
};

// Error handler for auth middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Auth Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong!',
  });
};

