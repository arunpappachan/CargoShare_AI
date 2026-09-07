const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// 1. GET Current User Profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 2. UPDATE User Profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, companyName, phone, region } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (companyName !== undefined) user.companyName = companyName.trim();
    if (region !== undefined) user.region = region;
    if (phone !== undefined && phone !== user.phone) {
      user.phone = phone.trim();
    }

    await user.save();

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        companyName: user.companyName,
        phone: user.phone,
        region: user.region,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});



module.exports = router;
