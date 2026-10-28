require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Start Express server binding to 0.0.0.0 for cloud hosting compatibility (Render, Railway, Fly)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`HostelHub Server running on http://localhost:${PORT}`);
  
  connectDB();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
  } else {
    console.error(`❌ Server error:`, err.message);
  }
});
