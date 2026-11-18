import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

// Protect Customer Route
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to continue.',
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found or session has expired.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

// Optional User Middleware (for cart, wishlist, view tracking without mandatory login)
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (err) {
    // Continue without user
  }
  next();
};

// Protect Admin Route
export const protectAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.admin_token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Admin access required. Please sign in to the Admin Portal.',
      });
    }

    const decoded = verifyToken(token);

    // Try finding in Admin model first, then User with role ADMIN
    let adminUser = await Admin.findById(decoded.id).select('-password');
    if (!adminUser) {
      adminUser = await User.findOne({ _id: decoded.id, role: 'ADMIN' }).select('-password');
    }

    if (!adminUser) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not possess administrator privileges.',
      });
    }

    if (!adminUser.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Admin account has been deactivated.',
      });
    }

    req.admin = adminUser;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired administrator session. Please sign in again.',
    });
  }
};
