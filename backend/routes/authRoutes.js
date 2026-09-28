const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

// 1. REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, companyName, phone, region } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Name, email, and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 8 characters long.' });
    }

    // Restrict role to prevent privilege escalation
    const validRoles = ['exporter', 'carrier'];
    const assignedRole = validRoles.includes(role) ? role : 'exporter';

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'Email is already registered. Please log in.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: assignedRole,
      companyName: companyName || '',
      phone: phone || '',
      region: region || '',
    });

    await newUser.save();

    // Generate JWT token for instant access
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        companyName: newUser.companyName,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
  const email = (req.body.email || '').toLowerCase().trim();
  const password = req.body.password || '';
  const role = req.body.role; // Optional, defaults if not provided

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid email address or password.' });
    }

    if (role && user.role !== role) {
      if (role === 'admin' && user.role !== 'admin') {
        return res.status(403).json({ status: 'error', message: 'Access denied. This account does not have Administrator privileges.' });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid email address or password.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      status: 'success',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
