const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    if (error.message.includes('whitelist') || error.message.includes('Could not connect to any servers')) {
      console.error('👉 TIP: Whitelist your IP in MongoDB Atlas (Network Access -> Add IP Address -> 0.0.0.0/0).');
    }
    return null;
  }
};

const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = { connectDB, isDBConnected };
