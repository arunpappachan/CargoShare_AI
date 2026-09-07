const mongoose = require('mongoose');

const spaceSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    index: true,
  },
  vessel: {
    type: String,
    required: true,
    trim: true,
  },
  carrier: {
    type: String,
    required: true,
    default: 'Oceanic Freight Ltd.',
  },
  origin: {
    type: String,
    required: true,
    trim: true,
  },
  dest: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  available: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Available', 'Full', 'Departed', 'Cancelled'],
    default: 'Available',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Space', spaceSchema);
