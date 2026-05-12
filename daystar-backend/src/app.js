require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ── Security & Logging ─────────────────────────────────────────────────────
app.use(helmet()); // Sets sensible security headers
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── CORS ───────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // Reject suspiciously large payloads
app.use(express.urlencoded({ extended: true }));

// ── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Daystar Daycare API',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth.routes'));
app.use('/api/babysitters', require('./routes/babysitters.routes'));
app.use('/api/children',    require('./routes/children.routes'));
app.use('/api/attendance',  require('./routes/attendance.routes'));
app.use('/api',             require('./routes/finance.routes'));
app.use('/api/incidents',   require('./routes/incidents.routes'));
app.use('/api',             require('./routes/dashboard.routes'));

// ── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found.`,
  });
});

// ── Global Error Handler ───────────────────────────────────────────────────
// MUST be last. Express identifies error handlers by 4 arguments.
app.use(errorHandler);

module.exports = app;