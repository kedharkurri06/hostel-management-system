const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  ticketId: {
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
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
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
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['AC', 'Water', 'Electrical', 'Wi-Fi', 'Cleanliness', 'Furniture', 'Pest Control']
  },
  priority: {
    type: String,
    required: [true, 'Priority is required'],
    enum: ['Low', 'Medium', 'High', 'Emergency']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: 2000
  },
  visitTimeSlot: {
    type: String,
    default: '10:00 AM - 1:00 PM'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending'
  },
  assignedTo: {
    type: String,
    default: 'Unassigned',
    trim: true
  },
  resolutionNotes: {
    type: String,
    default: '',
    trim: true,
    maxlength: 2000
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

complaintSchema.index({ status: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
