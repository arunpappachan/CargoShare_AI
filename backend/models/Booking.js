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
    enum: ['Pending Confirmation', 'Accepted', 'Approved', 'Rejected', 'In Transit', 'Delivered'],
    default: 'Pending Confirmation',
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Fully Paid', 'Advance Paid', 'Advance Paid (25%)', 'Partial Paid', 'In Escrow', 'Pending Verification', 'Unpaid'],
    default: 'Advance Paid (25%)',
  },
  paymentMethod: {
    type: String,
    default: 'UPI Advance (25%)',
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  advanceAmount: {
    type: Number,
    default: 0,
  },
  balanceAmount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  transactionId: {
    type: String,
    default: null,
  },
  documentName: {
    type: String,
    default: 'Commercial_Invoice.pdf',
  },
  documents: {
    type: [String],
    default: () => ['Commercial_Invoice.pdf', 'Packing_List.pdf', 'Shipping_Bill_EDI.pdf'],
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0],
  },
}, {
  timestamps: true,
});


module.exports = mongoose.model('Booking', bookingSchema);
