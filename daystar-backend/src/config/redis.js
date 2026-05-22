const Redis = process.env.NODE_ENV === 'test' ? require('ioredis-mock') : require('ioredis');
const logger = require('./logger');

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required by BullMQ
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    logger.warn(`Redis connection retry attempt ${times} in ${delay}ms`);
    return delay;
  },
};

logger.info(`Initializing Redis client connecting to ${redisConfig.host}:${redisConfig.port}...`);

const redis = new Redis(redisConfig);

redis.on('connect', () => {
  logger.info('Redis connection established');
});

redis.on('ready', () => {
  logger.info('Redis connection is ready');
});

redis.on('error', (err) => {
  logger.error('Redis connection error', { error: err.message, stack: err.stack });
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

module.exports = redis;
