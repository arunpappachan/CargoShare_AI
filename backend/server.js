require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const connectMongoDB = require('./config/db');
const { connectPostgres } = require('./config/postgres');

const Space = require('./models/Space');
const Booking = require('./models/Booking');
const User = require('./models/User');
const Document = require('./models/Document');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount API Route Modules
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// In-memory fallback stores (used only if MongoDB is offline)
let fallbackSpaces = [
  {
    id: 'SP-5001',
    vessel: 'MSC Oscar',
    carrier: 'Oceanic Freight Ltd.',
    origin: 'innsa',
    dest: 'inmun',
    date: '2026-09-01',
    capacity: 250,
    available: 180,
    price: 450,
    status: 'Available',
    createdAt: new Date()
  },
  {
    id: 'SP-5002',
    vessel: 'Ever Given',
    carrier: 'Maersk Logistics',
    origin: 'inmaa',
    dest: 'inccu',
    date: '2026-09-05',
    capacity: 400,
    available: 320,
    price: 520,
    status: 'Available',
    createdAt: new Date()
  }
];

let fallbackBookings = [
  {
    id: 'CS-1001',
    spaceId: 'SP-5001',
    route: 'innsa to inmun',
    carrier: 'Oceanic Freight Ltd.',
    exporterName: 'Apex Textiles SME',
    cbm: 25,
    commodity: 'Garments',
    weight: 4200,
    specialReq: 'Keep dry',
    status: 'Pending Confirmation',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date()
  }
];

let spaceIdCounter = 5003;
let bookingIdCounter = 1002;

// Check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Seed initial sample data to MongoDB if empty
const seedInitialData = async () => {
  try {
    if (!isMongoConnected()) return;

    const spacesCount = await Space.countDocuments();
    if (spacesCount === 0) {
      await Space.insertMany(fallbackSpaces);
      console.log('[MongoDB] Initial sample spaces seeded.');
    }

    const bookingsCount = await Booking.countDocuments();
    if (bookingsCount === 0) {
      await Booking.insertMany(fallbackBookings);
      console.log('[MongoDB] Initial sample bookings seeded.');
    }

    const usersCount = await User.countDocuments();
    if (usersCount === 0) {
      const defaultPassword = await bcrypt.hash('password123', 10);
      const adminPassword = await bcrypt.hash('admin123', 10);

      await User.insertMany([
        {
          name: 'Platform Administrator',
          email: 'admin@cargoshare.ai',
          password: adminPassword,
          role: 'admin',
          companyName: 'CargoShare AI Admin HQ',
          phone: '+1 555-0100',
          status: 'Active',
          emailVerified: true,
          phoneVerified: true,
          languagePreference: 'en',
        },
        {
          name: 'John Exporter',
          email: 'exporter@cargoshare.ai',
          password: defaultPassword,
          role: 'exporter',
          companyName: 'Global Exports SME',
          phone: '+1 555-0101',
          status: 'Active',
          emailVerified: true,
          phoneVerified: true,
          languagePreference: 'en',
        },
        {
          name: 'Captain Maersk',
          email: 'carrier@cargoshare.ai',
          password: defaultPassword,
          role: 'carrier',
          companyName: 'Oceanic Freight Ltd.',
          phone: '+1 555-0102',
          status: 'Active',
          emailVerified: true,
          phoneVerified: false,
          languagePreference: 'en',
        },
      ]);
      console.log('[MongoDB] Initial sample users seeded (admin, exporter, carrier).');
    }
  } catch (err) {
    console.error('[MongoDB] Seeding error:', err.message);
  }
};

// --- SYSTEM ROUTES ---

// Welcome Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the CargoShare AI Backend API!',
    databases: {
      mongodb: isMongoConnected() ? 'Connected' : 'Disconnected (Fallback active)',
    },
    version: '1.0.0'
  });
});

// Database Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    databases: {
      mongodb: {
        status: isMongoConnected() ? 'connected' : 'disconnected',
        host: mongoose.connection.host || null,
        name: mongoose.connection.name || null
      }
    }
  });
});

// --- SPACES API ---

// GET Spaces (Search filter support)
app.get('/api/spaces', async (req, res) => {
  try {
    const { origin, dest, date } = req.query;

    if (isMongoConnected()) {
      let filter = {};
      if (origin) filter.origin = new RegExp(origin, 'i');
      if (dest) filter.dest = new RegExp(dest, 'i');
      if (date) filter.date = date;

      const data = await Space.find(filter).sort({ createdAt: -1 });
      return res.json({ status: 'success', source: 'mongodb', data });
    }

    // Fallback in-memory query
    let filteredSpaces = fallbackSpaces;
    if (origin) filteredSpaces = filteredSpaces.filter(s => s.origin.toLowerCase().includes(origin.toLowerCase()));
    if (dest) filteredSpaces = filteredSpaces.filter(s => s.dest.toLowerCase().includes(dest.toLowerCase()));
    if (date) filteredSpaces = filteredSpaces.filter(s => s.date === date);

    res.json({ status: 'success', source: 'memory_fallback', data: filteredSpaces });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST Space
app.post('/api/spaces', async (req, res) => {
  try {
    const { vessel, origin, dest, date, capacity, price, carrier } = req.body;
    
    if (!vessel || !origin || !dest || !date || !capacity || !price) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    const newId = `SP-${spaceIdCounter++}`;
    const spaceData = {
      id: newId,
      vessel,
      carrier: carrier || 'Oceanic Freight Ltd.',
      origin,
      dest,
      date,
      capacity: Number(capacity),
      available: Number(capacity),
      price: Number(price),
      status: 'Available',
      createdAt: new Date()
    };

    if (isMongoConnected()) {
      const savedSpace = await Space.create(spaceData);
      console.log(`[MongoDB] New space saved: ${savedSpace.id}`);
      return res.status(201).json({ status: 'success', source: 'mongodb', data: savedSpace });
    }

    fallbackSpaces.push(spaceData);
    console.log(`[Memory] New space posted: ${spaceData.id}`);
    res.status(201).json({ status: 'success', source: 'memory_fallback', data: spaceData });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// --- BOOKINGS API ---

// GET Bookings
app.get('/api/bookings', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const data = await Booking.find().sort({ createdAt: -1 });
      return res.json({ status: 'success', source: 'mongodb', data });
    }

    res.json({ status: 'success', source: 'memory_fallback', data: fallbackBookings });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST Booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { route, carrier, cbm, spaceId, commodity, weight, specialReq, exporterName } = req.body;
    
    if (!route || !cbm) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    // Deduct available space if spaceId is provided
    if (spaceId) {
      if (isMongoConnected()) {
        const space = await Space.findOne({ id: spaceId });
        if (space) {
          space.available = Math.max(0, space.available - Number(cbm));
          if (space.available === 0) space.status = 'Full';
          await space.save();
        }
      } else {
        const spaceIndex = fallbackSpaces.findIndex(s => s.id === spaceId);
        if (spaceIndex !== -1) {
          fallbackSpaces[spaceIndex].available = Math.max(0, fallbackSpaces[spaceIndex].available - Number(cbm));
        }
      }
    }

    const newBookingData = {
      id: `CS-${bookingIdCounter++}`,
      spaceId: spaceId || null,
      route,
      carrier: carrier || 'AI Assigned Carrier',
      exporterName: exporterName || 'Global Exports SME',
      cbm: Number(cbm),
      commodity: commodity || 'General Cargo',
      weight: weight ? Number(weight) : null,
      specialReq: specialReq || 'None',
      status: 'Pending Confirmation',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date()
    };

    if (isMongoConnected()) {
      const savedBooking = await Booking.create(newBookingData);
      console.log(`[MongoDB] New booking saved: ${savedBooking.id}`);
      return res.status(201).json({ status: 'success', source: 'mongodb', data: savedBooking });
    }

    fallbackBookings.push(newBookingData);
    console.log(`[Memory] New booking saved: ${newBookingData.id}`);
    res.status(201).json({ status: 'success', source: 'memory_fallback', data: newBookingData });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PATCH Booking Status (Accept/Reject)
app.patch('/api/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ status: 'error', message: 'Status is required' });
    }

    if (isMongoConnected()) {
      const updatedBooking = await Booking.findOneAndUpdate(
        { id },
        { status },
        { new: true }
      );
      if (!updatedBooking) {
        return res.status(404).json({ status: 'error', message: 'Booking not found' });
      }
      return res.json({ status: 'success', source: 'mongodb', data: updatedBooking });
    }

    const bookingIndex = fallbackBookings.findIndex(b => b.id === id);
    if (bookingIndex === -1) {
      return res.status(404).json({ status: 'error', message: 'Booking not found' });
    }

    fallbackBookings[bookingIndex].status = status;
    res.json({ status: 'success', source: 'memory_fallback', data: fallbackBookings[bookingIndex] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Start Server and Initialize Database Connections
const startServer = async () => {
  console.log('--------------------------------------------------');
  console.log('Starting CargoShare AI Backend Services...');
  console.log('--------------------------------------------------');

  // Attempt database connections
  await connectMongoDB();
  await seedInitialData();

  // Attempt Postgres connection pool check (optional)
  if (process.env.PG_HOST) {
    connectPostgres().catch(() => {});
  }

  const server = require('http').createServer(app);
  const { Server } = require('socket.io');
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] User connected: ${socket.id}`);

    socket.on('join_booking', (bookingId) => {
      socket.join(bookingId);
      console.log(`[Socket.io] User ${socket.id} joined booking room: ${bookingId}`);
    });

    socket.on('send_message', (data) => {
      // Broadcast to everyone in the room
      io.to(data.bookingId).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] User disconnected: ${socket.id}`);
    });
  });

  server.listen(PORT, () => {
    console.log(`CargoShare AI Backend running on http://localhost:${PORT}`);
    console.log(`API Health Check: http://localhost:${PORT}/api/health`);
    console.log('--------------------------------------------------');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`⚠️  [Port Conflict] Port ${PORT} is already in use by another running process.`);
      console.error(`   To free port ${PORT} on Windows, run: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force`);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer();
