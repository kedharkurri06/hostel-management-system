const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  time: { type: String, required: true },
  items: [{ type: String }],
  type: { type: String, required: true }
}, { _id: false });

const menuSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    unique: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  breakfast: { type: mealSchema, required: true },
  lunch: { type: mealSchema, required: true },
  snacks: { type: mealSchema, required: true },
  dinner: { type: mealSchema, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);
