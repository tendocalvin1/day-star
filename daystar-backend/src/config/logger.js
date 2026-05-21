const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

/**
 * Winston Logger
 *
 * Levels: error > warn > info > http > debug
 *
 * Development: logs everything to console in readable format
 * Production:  logs to rotating files, errors separate from combined
 *
 * Log files rotate daily and are deleted after 30 days automatically.
 * Never use console.log in production code — use logger instead.
 */

const { combine, timestamp, printf, colorize, errors } = winston.format;

// ── Custom format for console output ───
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    if (stack) log += `\n${stack}`;
    return log;
  })
);

// ── JSON format for file output ───
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json()
);

// ── Transports ─────
const transports = [
  // Always log to console
  new winston.transports.Console({
    format: consoleFormat,
    silent: process.env.NODE_ENV === 'test', // suppress during tests
  }),
];

// Add file transports in production and development (not test)
if (process.env.NODE_ENV !== 'test') {
  transports.push(
    // Error logs only
    new DailyRotateFile({
      filename: path.join('logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: fileFormat,
      maxFiles: '30d',
      zippedArchive: true,
    }),
    // All logs combined
    new DailyRotateFile({
      filename: path.join('logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: fileFormat,
      maxFiles: '30d',
      zippedArchive: true,
    })
  );
}

// ── Create logger instance ────
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports,
  
  exitOnError: false,
});

module.exports = logger;