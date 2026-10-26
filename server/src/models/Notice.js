const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notice title is required'],
    trim: true,
    maxlength: 300
  },
  category: {
    type: String,
    required: true,
    enum: ['Maintenance', 'Mess & Food', 'HVAC', 'Security', 'General'],
    default: 'General'
  },
  priority: {
    type: String,
    enum: ['Normal', 'High'],
    default: 'Normal'
  },
  content: {
    type: String,
    required: [true, 'Notice content is required'],
    trim: true,
    maxlength: 5000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: String
  }
}, { timestamps: true });

noticeSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notice', noticeSchema);
