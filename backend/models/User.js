const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['exporter', 'carrier', 'admin'],
    default: 'exporter',
  },
  companyName: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  region: {
    type: String,
  },

}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
