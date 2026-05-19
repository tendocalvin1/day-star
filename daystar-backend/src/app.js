require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');
const rateLimit = require('express-rate-limit');

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

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many login attempts. Try again in 15 minutes.'
  }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100 // 100 requests per minute
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth.routes'));
app.use('/api/babysitters', require('./routes/babysitters.routes'));
app.use('/api/children',    require('./routes/children.routes'));
app.use('/api/attendance',  require('./routes/attendance.routes'));
app.use('/api',             require('./routes/finance.routes'));
app.use('/api/incidents',   require('./routes/incidents.routes'));
app.use('/api',             require('./routes/dashboard.routes'));
app.use('/api/auth/login', loginLimiter);
app.use('/api', apiLimiter);

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