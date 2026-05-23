

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const db = require('./config/database');
const logger = require('./config/logger');
const { errorHandler } = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');

const app = express();

// ── Security & Logging ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cookieParser());
app.use(compression());

// Morgan logs HTTP requests through Winston
app.use(morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
    skip: () => process.env.NODE_ENV === 'test',
  }
));

// ── CORS ───────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiting ───────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
});

app.use('/api/auth/login', loginLimiter);
app.use('/api', apiLimiter);

// ── API Documentation ───────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Daystar Daycare API Docs',
  customCss: '.swagger-ui .topbar { background-color: #1e40af; }',
}));

// ── Health Check ───────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await db.raw('SELECT 1');
    res.json({
      status: 'healthy',
      app: 'Daystar Daycare API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: 'connected',
      uptime: `${Math.floor(process.uptime())}s`,
    });
  } catch (err) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      ...(isProduction ? {} : { error: err.message }),
    });
  }
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
app.use(errorHandler);

module.exports = app;
