require('dotenv').config();
const mongoose = require('mongoose');

const Space = require('./models/Space');
const Booking = require('./models/Booking');
const User = require('./models/User');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/cargoshare';

async function clearDB() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
    
    await Space.deleteMany({});
    console.log('Cleared spaces collection');
    
    await Booking.deleteMany({});
    console.log('Cleared bookings collection');
    
    // Clear users too if they want full reset, but maybe it's safer to clear everything
    await User.deleteMany({});
    console.log('Cleared users collection');
    
    console.log('Database entries cleared.');
  } catch (err) {
    console.error('Error clearing database:', err);
  } finally {
    await mongoose.disconnect();
  }
}

clearDB();
