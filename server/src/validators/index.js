const mongoose = require('mongoose');

// Validate that a string is a valid MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Validate required fields exist and are non-empty strings
const validateRequired = (fields, body) => {
  const missing = [];
  for (const field of fields) {
    if (!body[field] || (typeof body[field] === 'string' && !body[field].trim())) {
      missing.push(field);
    }
  }
  return missing;
};

// Validate enum value
const validateEnum = (value, allowed, fieldName) => {
  if (value && !allowed.includes(value)) {
    return `${fieldName} must be one of: ${allowed.join(', ')}`;
  }
  return null;
};

// Sanitize string input (basic XSS prevention)
const sanitize = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .trim();
};

module.exports = { isValidObjectId, validateRequired, validateEnum, sanitize };
