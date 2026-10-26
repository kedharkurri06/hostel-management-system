const mongoose = require('mongoose');

const wardenSchema = new mongoose.Schema({
  wardenId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Warden name is required'],
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  block: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  office: {
    type: String,
    trim: true
  },
  hours: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Warden', wardenSchema);
