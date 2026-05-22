const { Queue, Worker } = require('bullmq');
const redis = require('./redis');
const logger = require('./logger');

const isTest = process.env.NODE_ENV === 'test';

let notificationQueue = null;
let paymentQueue = null;
let aiTaskQueue = null;

let queues = {};

if (!isTest) {
  // Use BullMQ in development/production
  const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  };

  notificationQueue = new Queue('notificationQueue', { connection });
  paymentQueue = new Queue('paymentQueue', { connection });
  aiTaskQueue = new Queue('aiTaskQueue', { connection });

  queues = {
    notificationQueue,
    paymentQueue,
    aiTaskQueue,
  };

  // Define workers
  const { NotificationModel, BabysitterPaymentModel, AttendanceModel } = require('../models');

  const RATES = {
    half_day: 2000,
    full_day: 5000,
  };

  const notificationWorker = new Worker('notificationQueue', async (job) => {
    logger.info(`Processing notification job ${job.id}`, { data: job.data });
    const { type, title, message, userId, relatedId, relatedType } = job.data;
    await NotificationModel.notify({ type, title, message, userId, relatedId, relatedType });
  }, { connection });

  const paymentWorker = new Worker('paymentQueue', async (job) => {
    logger.info(`Processing payment generation job ${job.id}`, { data: job.data });
    const { date, userId } = job.data;

    const attendanceRows = await AttendanceModel.getForPaymentCalculation(date);
    if (attendanceRows.length === 0) {
      logger.info(`No attendance records for ${date}. No payments generated.`);
      return;
    }

    const byBabysitter = {};
    for (const row of attendanceRows) {
      const bid = row.babysitter_id;
      if (!byBabysitter[bid]) {
        byBabysitter[bid] = { half_day: 0, full_day: 0 };
      }
      byBabysitter[bid][row.session_type] += parseInt(row.child_count, 10);
    }

    for (const [babysitterId, counts] of Object.entries(byBabysitter)) {
      const amount_ugx = counts.half_day * RATES.half_day + counts.full_day * RATES.full_day;
      const total_children = counts.half_day + counts.full_day;

      await BabysitterPaymentModel.upsert({
        babysitter_id: parseInt(babysitterId, 10),
        date,
        half_day_children: counts.half_day,
        full_day_children: counts.full_day,
        total_children,
        amount_ugx,
        created_by: userId,
      });
    }
    logger.info(`Successfully generated payments for ${date}`);
  }, { connection });

  const aiTaskWorker = new Worker('aiTaskQueue', async (job) => {
    logger.info(`Processing AI task job ${job.id}`, { data: job.data });
    // Future AI worker placeholder
  }, { connection });

  // Handle worker errors
  [notificationWorker, paymentWorker, aiTaskWorker].forEach((worker) => {
    worker.on('failed', (job, err) => {
      logger.error(`Job ${job ? job.id : 'unknown'} failed in queue ${worker.name}`, { error: err.message, stack: err.stack });
    });
  });

} else {
  // Mock queues for testing environment
  logger.info('Mocking queues for testing environment');
}

// Helper methods to enqueue jobs
async function addNotificationJob(data) {
  if (isTest) {
    logger.info('Test environment: Mock notification job executed synchronously');
    const { NotificationModel } = require('../models');
    await NotificationModel.notify(data);
    return { id: 'mock-job-id' };
  }
  return notificationQueue.add('send_notification', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
}

async function addPaymentJob(data) {
  if (isTest) {
    logger.info('Test environment: Mock payment job executed synchronously');
    const { BabysitterPaymentModel, AttendanceModel } = require('../models');
    const { date, userId } = data;
    const RATES = { half_day: 2000, full_day: 5000 };
    const attendanceRows = await AttendanceModel.getForPaymentCalculation(date);
    if (attendanceRows.length > 0) {
      const byBabysitter = {};
      for (const row of attendanceRows) {
        const bid = row.babysitter_id;
        if (!byBabysitter[bid]) byBabysitter[bid] = { half_day: 0, full_day: 0 };
        byBabysitter[bid][row.session_type] += parseInt(row.child_count, 10);
      }
      for (const [babysitterId, counts] of Object.entries(byBabysitter)) {
        const amount_ugx = counts.half_day * RATES.half_day + counts.full_day * RATES.full_day;
        const total_children = counts.half_day + counts.full_day;
        await BabysitterPaymentModel.upsert({
          babysitter_id: parseInt(babysitterId, 10),
          date,
          half_day_children: counts.half_day,
          full_day_children: counts.full_day,
          total_children,
          amount_ugx,
          created_by: userId,
        });
      }
    }
    return { id: 'mock-job-id' };
  }
  return paymentQueue.add('generate_payments', data, {
    attempts: 1,
  });
}

async function addAiTaskJob(data) {
  if (isTest) {
    logger.info('Test environment: Mock AI task job logged');
    return { id: 'mock-job-id' };
  }
  return aiTaskQueue.add('process_ai_task', data);
}

module.exports = {
  addNotificationJob,
  addPaymentJob,
  addAiTaskJob,
  queues
};
