require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Start Express server immediately so port 5000 is always online
const server = app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 HostelHub Server running on http://localhost:${PORT}`);
  console.log(`👉 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`👉 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=================================================`);
  
  // Connect to MongoDB
  connectDB();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
  } else {
    console.error(`❌ Server error:`, err.message);
  }
});
