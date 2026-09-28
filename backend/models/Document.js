const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  docId: {
    type: String,
    unique: true,
    index: true,
  },
  bookingId: {
    type: String,
    required: false,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'Commercial Invoice',
      'Packing List',
      'Certificate of Origin',
      'Bill of Lading',
      'Customs Declaration',
      'Other'
    ],
  },
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Verified', 'Pending Review', 'Rejected'],
    default: 'Pending Review',
  },
  uploadedBy: {
    type: String,
    default: 'Exporter',
  },
  date: {
    type: String,
    default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Document', documentSchema);
