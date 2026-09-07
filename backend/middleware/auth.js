const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'cargoshare_ai_super_secret_jwt_key_2026';

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No authentication token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid session: User not found.',
      });
    }

    // Check account status
    if (user.status === 'Blocked') {
      return res.status(403).json({
        status: 'error',
        code: 'ACCOUNT_BLOCKED',
        message: 'Your account has been blocked. Please contact platform support.',
      });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({
        status: 'error',
        code: 'ACCOUNT_SUSPENDED',
        message: 'Your account is currently suspended. Please contact administrator.',
      });
    }

    if (user.status === 'Deactivated') {
      return res.status(403).json({
        status: 'error',
        code: 'ACCOUNT_DEACTIVATED',
        message: 'This account has been deactivated.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        code: 'TOKEN_EXPIRED',
        message: 'Session expired. Please log in again.',
      });
    }
    return res.status(401).json({
      status: 'error',
      message: 'Invalid authentication token.',
    });
  }
};

module.exports = {
  verifyToken,
  JWT_SECRET,
};
