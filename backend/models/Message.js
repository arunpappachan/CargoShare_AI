const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    index: true,
  },
  bookingId: {
    type: String,
    required: true,
    index: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  senderName: {
    type: String,
    default: 'Anonymous',
  },
  role: {
    type: String,
    enum: ['exporter', 'carrier', 'admin'],
    required: true,
  },
  time: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Message', messageSchema);
