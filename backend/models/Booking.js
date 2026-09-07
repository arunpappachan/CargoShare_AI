const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    index: true,
  },
  spaceId: {
    type: String,
    default: null,
  },
  route: {
    type: String,
    required: true,
  },
  carrier: {
    type: String,
    default: 'AI Assigned Carrier',
  },
  exporterName: {
    type: String,
    default: 'Global Exports SME',
  },
  cbm: {
    type: Number,
    required: true,
  },
  commodity: {
    type: String,
    default: 'General Cargo',
  },
  weight: {
    type: Number,
    default: null,
  },
  specialReq: {
    type: String,
    default: 'None',
  },
  status: {
    type: String,
    enum: ['Pending Confirmation', 'Accepted', 'Rejected', 'In Transit', 'Delivered'],
    default: 'Pending Confirmation',
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Booking', bookingSchema);
