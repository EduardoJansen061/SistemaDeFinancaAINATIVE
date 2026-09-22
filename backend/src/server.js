require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const { sequelize, testConnection } = require('./config/database');
require('./models/index'); // Load associations

const app = express();
const PORT = process.env.PORT || 3001;

// =============================================
// Security Middleware
// =============================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// =============================================
// Routes
// =============================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/incomes', require('./routes/incomes'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/summary', require('./routes/summary'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/webhooks', require('./routes/webhooks'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

// =============================================
// Start Server
// =============================================
const startServer = async () => {
  await testConnection();

  // Sync models (safe — won't drop tables)
  await sequelize.sync({ alter: false });
  console.log('✅ Database models synchronized.');

  app.listen(PORT, () => {
    console.log(`🚀 FinançasPRO API running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV}`);
  });
};

startServer().catch(console.error);

module.exports = app; // Export for testing
// nodemon trigger
