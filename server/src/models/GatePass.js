const mongoose = require('mongoose');

const gatePassSchema = new mongoose.Schema({
  passId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  roomNo: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  block: {
    type: String,
    required: [true, 'Block is required'],
    enum: ['Block A (Boys)', 'Block B (Girls)', 'Block C (International)']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  purpose: {
    type: String,
    required: [true, 'Purpose is required'],
    trim: true,
    maxlength: 500
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true,
    maxlength: 200
  },
  outDate: {
    type: String,
    required: [true, 'Out date is required']
  },
  returnDate: {
    type: String,
    required: [true, 'Return date is required']
  },
  type: {
    type: String,
    required: true,
    enum: ['Day Pass', 'Weekend Pass', 'Emergency Pass', 'Medical Pass', 'Vacation Pass'],
    default: 'Day Pass'
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  wardenRemarks: {
    type: String,
    default: '',
    trim: true,
    maxlength: 1000
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  }
}, { timestamps: true });

gatePassSchema.index({ status: 1 });
gatePassSchema.index({ createdAt: -1 });
gatePassSchema.index({ submittedBy: 1 });

module.exports = mongoose.model('GatePass', gatePassSchema);
