const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const menuRoutes = require('./routes/menuRoutes');
const wardenRoutes = require('./routes/wardenRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const gatePassRoutes = require('./routes/gatePassRoutes');

const app = express();

// CORS configuration supporting local dev and cloud deployments (Vercel & Render)
const configuredOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Allow configured origins
    if (configuredOrigins.includes(origin)) return callback(null, true);

    // Allow any Vercel deployment preview or production domain (*.vercel.app)
    if (/\.vercel\.app$/.test(origin) || /localhost:[0-9]+$/.test(origin)) {
      return callback(null, true);
    }

    // Allow all other clients while respecting credentials
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root & Health Checks for Render / Cloud Uptime Monitoring
app.get(['/', '/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'HostelHub API Backend',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime())
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/wardens', wardenRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/gatepasses', gatePassRoutes);

// Serve static frontend assets if built on Render / production
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl === '/health') {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 Handler for API endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
