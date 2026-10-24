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
const Message = require('./models/Message');

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
    date: '2028-09-01',
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
    route: 'Mumbai (Nhava Sheva/JNPT) → Mundra Port',
    carrier: 'Oceanic Freight Ltd.',
    exporterName: 'Apex Textiles SME',
    cbm: 25,
    commodity: 'Garments & Apparels',
    weight: 4200,
    specialReq: 'Keep dry, Moisture proof packaging',
    status: 'Pending Confirmation',
    paymentStatus: 'Advance Paid (25%)',
    paymentMethod: 'UPI QR Scanner',
    amountPaid: 7113,
    advanceAmount: 7113,
    balanceAmount: 21337,
    totalAmount: 28450,
    transactionId: 'TXN-98421033',
    date: '2026-10-24',
    documents: ['Commercial_Invoice_Apex.pdf', 'Packing_List_Apex.pdf', 'Shipping_Bill_EDI.pdf'],
    createdAt: new Date()
  },
  {
    id: 'CS-1002',
    spaceId: 'SP-5002',
    route: 'Chennai Port → Kolkata Port',
    carrier: 'Oceanic Freight Ltd.',
    exporterName: 'Bharat Agro Exporters Ltd.',
    cbm: 18,
    commodity: 'Organic Basmati Rice (1121 Grade)',
    weight: 12500,
    specialReq: 'Food-grade dry container, fumigation cert required',
    status: 'Approved',
    paymentStatus: 'Advance Paid (25%)',
    paymentMethod: 'UPI QR Scanner',
    amountPaid: 6200,
    advanceAmount: 6200,
    balanceAmount: 18600,
    totalAmount: 24800,
    transactionId: 'TXN-77219044',
    date: '2026-10-23',
    documents: ['Invoice_Bharat_Agro.pdf', 'Phytosanitary_Cert.pdf', 'Packing_List.pdf'],
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: 'CS-1003',
    spaceId: 'SP-5001',
    route: 'Cochin Port → Visakhapatnam Port',
    carrier: 'Oceanic Freight Ltd.',
    exporterName: 'Zenith Spices & Commodities',
    cbm: 32,
    commodity: 'Cardamom & Black Pepper Lots',
    weight: 6800,
    specialReq: 'Temperature regulated 18-22C',
    status: 'In Transit',
    paymentStatus: 'In Escrow',
    paymentMethod: 'CargoShare Smart Escrow',
    amountPaid: 39500,
    totalAmount: 39500,
    transactionId: 'TXN-66103982',
    date: '2026-10-22',
    documents: ['Spices_Board_Invoice.pdf', 'Certificate_of_Origin.pdf', 'Quality_Inspection.pdf'],
    createdAt: new Date(Date.now() - 172800000)
  },
  {
    id: 'CS-1004',
    spaceId: 'SP-5002',
    route: 'Kandla Port → Mumbai (JNPT)',
    carrier: 'Oceanic Freight Ltd.',
    exporterName: 'Vanguard Industrial Machinery',
    cbm: 14,
    commodity: 'Precision CNC Hydraulic Valves',
    weight: 3100,
    specialReq: 'Heavy lift, strapped pallets with shock sensors',
    status: 'Approved',
    paymentStatus: 'Paid',
    paymentMethod: 'UPI QR Scanner',
    amountPaid: 19200,
    totalAmount: 19200,
    transactionId: 'TXN-44192031',
    date: '2026-10-21',
    documents: ['Machinery_Invoice_Vanguard.pdf', 'Technical_Packing_List.pdf', 'Weight_Cert.pdf'],
    createdAt: new Date(Date.now() - 259200000)
  },
  {
    id: 'CS-1005',
    spaceId: 'SP-5001',
    route: 'Mangalore Port → Mundra Port',
    carrier: 'Oceanic Freight Ltd.',
    exporterName: 'Orient Petrochem Traders',
    cbm: 10,
    commodity: 'Industrial Polymer Resins',
    weight: 2800,
    specialReq: 'Hazard class 9 certified container',
    status: 'Pending Confirmation',
    paymentStatus: 'Pending Verification',
    paymentMethod: 'B2B Bank Wire (NEFT/RTGS)',
    amountPaid: 0,
    totalAmount: 14500,
    transactionId: 'UTR-HDFC998231',
    date: '2026-10-24',
    documents: ['MSDS_Chemical_Safety.pdf', 'Proforma_Invoice.pdf'],
    createdAt: new Date()
  }
];

let fallbackDocuments = [
  { docId: 'INV-1029', bookingId: 'CS-1001', type: 'Commercial Invoice', status: 'Verified', date: 'Oct 24, 2026', fileName: 'Commercial_Invoice_Apex.pdf', fileSize: '245 KB', exporter: 'Apex Textiles SME' },
  { docId: 'PL-8821', bookingId: 'CS-1001', type: 'Packing List', status: 'Verified', date: 'Oct 24, 2026', fileName: 'Packing_List_Apex.pdf', fileSize: '180 KB', exporter: 'Apex Textiles SME' },
  { docId: 'SB-4402', bookingId: 'CS-1001', type: 'Shipping Bill (Customs EDI)', status: 'Verified', date: 'Oct 24, 2026', fileName: 'Shipping_Bill_EDI.pdf', fileSize: '320 KB', exporter: 'Apex Textiles SME' },
  { docId: 'INV-1030', bookingId: 'CS-1002', type: 'Commercial Invoice', status: 'Verified', date: 'Oct 23, 2026', fileName: 'Invoice_Bharat_Agro.pdf', fileSize: '410 KB', exporter: 'Bharat Agro Exporters Ltd.' },
  { docId: 'PHY-9901', bookingId: 'CS-1002', type: 'Phytosanitary Certificate', status: 'Verified', date: 'Oct 23, 2026', fileName: 'Phytosanitary_Cert.pdf', fileSize: '195 KB', exporter: 'Bharat Agro Exporters Ltd.' },
  { docId: 'INV-1031', bookingId: 'CS-1003', type: 'Spices Board Invoice & Certificate', status: 'Verified', date: 'Oct 22, 2026', fileName: 'Spices_Board_Invoice.pdf', fileSize: '350 KB', exporter: 'Zenith Spices & Commodities' },
  { docId: 'COO-2210', bookingId: 'CS-1003', type: 'Certificate of Origin', status: 'Verified', date: 'Oct 22, 2026', fileName: 'Certificate_of_Origin.pdf', fileSize: '210 KB', exporter: 'Zenith Spices & Commodities' },
  { docId: 'INV-1032', bookingId: 'CS-1004', type: 'Commercial Invoice & Weight Slip', status: 'Verified', date: 'Oct 21, 2026', fileName: 'Machinery_Invoice_Vanguard.pdf', fileSize: '280 KB', exporter: 'Vanguard Industrial Machinery' },
  { docId: 'MSDS-881', bookingId: 'CS-1005', type: 'Material Safety Data Sheet (MSDS)', status: 'Pending Review', date: 'Oct 24, 2026', fileName: 'MSDS_Chemical_Safety.pdf', fileSize: '520 KB', exporter: 'Orient Petrochem Traders' }
];


let fallbackMessages = [
  {
    id: 'MSG-INIT-1',
    bookingId: 'CS-8812',
    text: 'Hello! We booked 15 CBM on this route. Could we confirm the loading schedule and rate?',
    senderName: 'John Exporter',
    role: 'exporter',
    time: '10:15 AM',
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    id: 'MSG-INIT-2',
    bookingId: 'CS-8812',
    text: 'Hello! The vessel departs on schedule. Container loading begins tomorrow at 08:00 AM. Rate confirmed.',
    senderName: 'Captain Maersk',
    role: 'carrier',
    time: '10:22 AM',
    createdAt: new Date(Date.now() - 3000000)
  }
];

let spaceIdCounter = 5003;
let bookingIdCounter = 1002;
let docIdCounter = 1000;

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
    console.log("[SEARCH API] Query params received:", { origin, dest, date });

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

    const newId = `SP-${Date.now()}`;
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
    const { 
      route, 
      carrier, 
      cbm, 
      spaceId, 
      commodity, 
      weight, 
      specialReq, 
      exporterName,
      paymentStatus,
      paymentMethod,
      amountPaid,
      advanceAmount,
      balanceAmount,
      totalAmount,
      transactionId,
      documentName,
      documents
    } = req.body;
    
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

    const calculatedTotal = totalAmount ? Number(totalAmount) : (Number(cbm) * 520 * 1.18);
    const calculatedAdvance = advanceAmount !== undefined ? Number(advanceAmount) : Math.round(calculatedTotal * 0.25);
    const calculatedBalance = balanceAmount !== undefined ? Number(balanceAmount) : Math.max(0, calculatedTotal - calculatedAdvance);
    const calculatedPaid = amountPaid !== undefined ? Number(amountPaid) : calculatedAdvance;

    const newBookingData = {
      id: `CS-${Date.now().toString().slice(-4)}`,
      spaceId: spaceId || null,
      route,
      carrier: carrier || 'AI Assigned Carrier',
      exporterName: exporterName || 'Global Exports SME',
      cbm: Number(cbm),
      commodity: commodity || 'General Cargo',
      weight: weight ? Number(weight) : null,
      specialReq: specialReq || 'None',
      status: 'Pending Confirmation',
      paymentStatus: paymentStatus || 'Advance Paid (25%)',
      paymentMethod: paymentMethod || 'UPI Advance (25%)',
      amountPaid: Math.round(calculatedPaid),
      advanceAmount: Math.round(calculatedAdvance),
      balanceAmount: Math.round(calculatedBalance),
      totalAmount: Math.round(calculatedTotal),
      transactionId: transactionId || `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
      documentName: documentName || 'Commercial_Invoice.pdf',
      documents: documents || ['Commercial_Invoice.pdf', 'Packing_List.pdf', 'Shipping_Bill_EDI.pdf'],
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

// PATCH Booking Status (Accept/Approve/Reject)
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

// PATCH Booking Payment (UPI QR Scanner / Advance / Remaining Balance)
app.patch('/api/bookings/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentMethod, amountPaid, balanceAmount, transactionId } = req.body;

    const updateFields = {
      paymentStatus: paymentStatus || 'Paid',
      paymentMethod: paymentMethod || 'UPI QR Scanner',
    };
    if (amountPaid !== undefined) updateFields.amountPaid = Number(amountPaid);
    if (balanceAmount !== undefined) updateFields.balanceAmount = Number(balanceAmount);
    if (transactionId) updateFields.transactionId = transactionId;

    if (isMongoConnected()) {
      const updatedBooking = await Booking.findOneAndUpdate(
        { id },
        updateFields,
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

    fallbackBookings[bookingIndex] = {
      ...fallbackBookings[bookingIndex],
      ...updateFields
    };
    res.json({ status: 'success', source: 'memory_fallback', data: fallbackBookings[bookingIndex] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});



// --- DOCUMENTS API ---

// GET Documents (optionally filter by bookingId)
app.get('/api/documents', async (req, res) => {
  try {
    const { bookingId } = req.query;
    if (isMongoConnected()) {
      let filter = {};
      if (bookingId) filter.bookingId = bookingId;
      const data = await Document.find(filter).sort({ createdAt: -1 });
      return res.json({ status: 'success', source: 'mongodb', data });
    }
    
    let filteredDocs = fallbackDocuments;
    if (bookingId) filteredDocs = filteredDocs.filter(d => d.bookingId === bookingId);
    res.json({ status: 'success', source: 'memory_fallback', data: filteredDocs });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST Document
app.post('/api/documents', async (req, res) => {
  try {
    const { bookingId, type, fileName } = req.body;
    
    if (!type || !fileName) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    const newDocId = `DOC-${docIdCounter++}`;
    const newDocData = {
      docId: newDocId,
      bookingId: bookingId || null,
      type,
      fileName,
      status: 'Pending Review',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      createdAt: new Date()
    };

    if (isMongoConnected()) {
      const savedDoc = await Document.create(newDocData);
      console.log(`[MongoDB] New document saved: ${savedDoc.docId}`);
      return res.status(201).json({ status: 'success', source: 'mongodb', data: savedDoc });
    }

    fallbackDocuments.push(newDocData);
    console.log(`[Memory] New document saved: ${newDocData.docId}`);
    res.status(201).json({ status: 'success', source: 'memory_fallback', data: newDocData });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// --- NEGOTIATION CHAT & MESSAGES API ---

// GET Messages for a booking
app.get('/api/messages/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    if (isMongoConnected()) {
      const messages = await Message.find({ bookingId }).sort({ createdAt: 1 });
      return res.json({ status: 'success', source: 'mongodb', data: messages });
    }
    const messages = fallbackMessages.filter(m => m.bookingId === bookingId);
    res.json({ status: 'success', source: 'memory_fallback', data: messages });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST Message
app.post('/api/messages', async (req, res) => {
  try {
    const { bookingId, text, senderName, role, time } = req.body;
    if (!bookingId || !text) {
      return res.status(400).json({ status: 'error', message: 'bookingId and text are required' });
    }

    const messageData = {
      id: req.body.id || `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      bookingId,
      text: text.trim(),
      senderName: senderName || (role === 'carrier' ? 'Carrier' : 'Exporter'),
      role: role || 'exporter',
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date(),
    };

    let savedMessage = messageData;
    if (isMongoConnected()) {
      savedMessage = await Message.create(messageData);
    } else {
      const exists = fallbackMessages.some(m => m.id === messageData.id);
      if (!exists) {
        fallbackMessages.push(messageData);
      }
    }

    // Broadcast through socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(bookingId).emit('receive_message', savedMessage);
    }

    res.status(201).json({ status: 'success', data: savedMessage });
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
  app.set('io', io);

  io.on('connection', (socket) => {
    console.log(`[Socket.io] User connected: ${socket.id}`);

    socket.on('join_booking', async (bookingId) => {
      if (!bookingId) return;
      socket.join(bookingId);
      console.log(`[Socket.io] User ${socket.id} joined booking room: ${bookingId}`);

      // Emit chat history to newly joined user
      try {
        let history = [];
        if (isMongoConnected()) {
          history = await Message.find({ bookingId }).sort({ createdAt: 1 });
        } else {
          history = fallbackMessages.filter(m => m.bookingId === bookingId);
        }
        socket.emit('chat_history', history);
      } catch (err) {
        console.error('[Socket.io] Error fetching chat history on join:', err.message);
      }
    });

    socket.on('send_message', async (data) => {
      if (!data || !data.bookingId || !data.text) return;
      try {
        const messageData = {
          id: data.id || `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          bookingId: data.bookingId,
          text: data.text.trim(),
          senderName: data.senderName || (data.role === 'carrier' ? 'Carrier' : 'Exporter'),
          role: data.role || 'exporter',
          time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: new Date(),
        };

        let saved = messageData;
        if (isMongoConnected()) {
          saved = await Message.create(messageData);
        } else {
          const exists = fallbackMessages.some(m => m.id === messageData.id);
          if (!exists) {
            fallbackMessages.push(messageData);
          }
        }

        // Broadcast to everyone in the room (including sender)
        io.to(data.bookingId).emit('receive_message', saved);
      } catch (err) {
        console.error('[Socket.io] Error saving/broadcasting message:', err.message);
      }
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
