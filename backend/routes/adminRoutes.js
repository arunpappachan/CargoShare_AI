const express = require('express');
const router = express.Router();
const User = require('../models/User');

const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// Protect all admin routes with authentication + admin role check
router.use(verifyToken, requireRole(['admin']));

// 1. GET ALL USERS (with filters)
router.get('/users', async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { companyName: new RegExp(search, 'i') },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});



module.exports = router;
