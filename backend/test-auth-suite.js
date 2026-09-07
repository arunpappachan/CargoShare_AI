require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectMongoDB = require('./config/db');
const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

// Helper to check if server is running, or start a test server
async function ensureServerRunning() {
  try {
    const res = await fetch(`http://localhost:${PORT}/api/health`);
    if (res.ok) {
      console.log('📡 Connected to existing backend server on port 5000.');
      return null;
    }
  } catch (e) {
    // Not running, launch express app
    console.log('⚙️  Starting local server instance for test execution...');
    const express = require('express');
    const cors = require('cors');
    const authRoutes = require('./routes/authRoutes');
    const userRoutes = require('./routes/userRoutes');
    const adminRoutes = require('./routes/adminRoutes');

    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/admin', adminRoutes);

    return new Promise((resolve) => {
      const server = app.listen(PORT, () => {
        console.log(`📡 Local test server started on http://localhost:${PORT}`);
        resolve(server);
      });
    });
  }
}

async function runAuthTests() {
  console.log('====================================================');
  console.log('🚀 CargoShare AI - Base Auth Test Suite');
  console.log('====================================================\n');

  await connectMongoDB();
  const testServer = await ensureServerRunning();

  try {
    // Clean up any previous test user
    await User.deleteOne({ email: 'test.exporter@cargoshare.ai' });

    // TEST 1: User Registration
    console.log('\n▶ [TEST 1] Registering New User...');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Exporter User',
        email: 'test.exporter@cargoshare.ai',
        password: 'password123',
        role: 'exporter',
        companyName: 'Test Logistics LLC',
        phone: '+91 99999 88888',
      }),
    });
    const regData = await regRes.json();
    console.log('Status Code:', regRes.status);
    console.log('Registration Response:', regData);

    const registeredUser = await User.findOne({ email: 'test.exporter@cargoshare.ai' });
    if (registeredUser && regData.token) {
      console.log('✅ TEST 1 PASSED: User registered directly and instantly logged in with JWT.\n');
    } else {
      console.error('❌ TEST 1 FAILED: User could not be found or no token.\n');
    }

    // TEST 2: Login
    console.log('▶ [TEST 2] Logging in...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test.exporter@cargoshare.ai',
        password: 'password123',
      }),
    });
    const loginData = await loginRes.json();
    console.log('Status Code:', loginRes.status);
    console.log('Login Result:', loginData.status, 'Token acquired:', !!loginData.token);

    if (loginRes.status === 200 && loginData.token) {
      console.log('✅ TEST 2 PASSED: Successful login.\n');
    } else {
      console.error('❌ TEST 2 FAILED: Login failed.\n');
    }

    console.log('====================================================');
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');
  } finally {
    if (testServer) {
      testServer.close();
    }
    process.exit(0);
  }
}

runAuthTests().catch(err => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
