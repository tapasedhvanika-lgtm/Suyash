'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// services/Production/mrpQueue.js
// Phase 05 — BE-018
//
// UPDATED: Added retryStrategy to prevent infinite Redis connection spam.
// UPDATED: Added graceful error handling for enqueueMrpRun and getJobStatus.
// ─────────────────────────────────────────────────────────────────────────────

const Queue = require('bull');

// ✅ FIX 1: Move requires to the TOP (outside the worker function)
const { MrpRun } = require('../../models/Production/MrpRun');
const { runMrpJob } = require('./mrpService');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// ── Redis Connection Options ──────────────────────────────────────────────────
// ✅ FIX 2: Stop retrying after 3 attempts to prevent infinite error spam
const redisOptions = {
  retryStrategy: (times) => {
    if (times > 3) {
      console.warn('[MRP Queue] ⚠️ Redis connection failed 3 times. Stopping retries.');
      return null; // Stop retrying
    }
    return Math.min(times * 500, 2000); // Retry after 0.5s, 1s, 1.5s
  }
};

// ── Create Bull queue connected to Redis ──────────────────────────────────────
const mrpQueue = new Queue('mrp-runs', REDIS_URL, {
  redis: redisOptions,
  defaultJobOptions: {
    attempts:         2,                              // retry once on failure
    backoff:          { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,                            // keep last 100 completed jobs
    removeOnFail:     50,                             // keep last 50 failed jobs
  },
});

// ── Worker: process one MRP job at a time (CPU intensive) ────────────────────
mrpQueue.process('run-mrp', 1, async (job) => {
  await MrpRun.findByIdAndUpdate(job.data.mrpRunId, { status: 'Running' });
  await runMrpJob(job.data.mrpRunId, job);
});

// ── Queue lifecycle logs ──────────────────────────────────────────────────────
mrpQueue.on('ready', () => {
  console.log('[MRP Queue] ✓ Connected to Redis —', REDIS_URL);
});

mrpQueue.on('completed', (job) => {
  console.log(`[MRP Queue] ✓ Job ${job.id} completed — MRP Run ${job.data.mrpRunId}`);
});

mrpQueue.on('failed', (job, err) => {
  console.error(`[MRP Queue] ✗ Job ${job.id} FAILED — MRP Run ${job.data.mrpRunId}:`, err.message);
});

// ✅ FIX 3: Suppress the error spam. Log once and move on.
mrpQueue.on('error', (err) => {
  // Only log if it's not the typical ECONNREFUSED to avoid terminal spam
  if (err.message.includes('ECONNREFUSED')) {
    // Silent fail or log once
  } else {
    console.error('[MRP Queue] Queue error:', err.message);
  }
});

mrpQueue.on('stalled', (job) => {
  console.warn(`[MRP Queue] Job ${job.id} stalled — will retry automatically`);
});

// ─────────────────────────────────────────────────────────────────────────────
// enqueueMrpRun
// ─────────────────────────────────────────────────────────────────────────────
async function enqueueMrpRun(mrpRunId) {
  try {
    // Check if queue is ready/connected before adding job
    const isReady = await mrpQueue.isReady().catch(() => false);
    
    if (!isReady) {
      throw new Error('MRP Queue is not connected to Redis. Please start Redis or check the connection.');
    }

    const job = await mrpQueue.add(
      'run-mrp',
      { mrpRunId },
    );
    console.log(`[MRP Queue] MRP Run ${mrpRunId} added to queue as job ${job.id}`);
    return { jobId: String(job.id) };
  } catch (error) {
    console.error(`[MRP Queue] Failed to enqueue MRP Run ${mrpRunId}:`, error.message);
    throw error; // Let the controller catch this and return 503
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getJobStatus
// ─────────────────────────────────────────────────────────────────────────────
async function getJobStatus(jobId) {
  try {
    const isReady = await mrpQueue.isReady().catch(() => false);
    if (!isReady) {
      return {
        state: 'unknown',
        note:  'Redis is not connected — queue status unavailable',
      };
    }

    const job = await mrpQueue.getJob(jobId);

    if (!job) {
      return {
        state: 'unknown',
        note:  'Job not found in queue — either completed and cleaned up, or invalid job_id',
      };
    }

    const state    = await job.getState();
    const progress = job._progress || 0;

    return {
      state,          // waiting | active | completed | failed | delayed
      progress,       // 0-100
      failedReason: job.failedReason || null,
    };
  } catch (error) {
    console.error(`[MRP Queue] Failed to get job status for ${jobId}:`, error.message);
    return {
      state: 'error',
      note:  `Failed to fetch job status: ${error.message}`,
    };
  }
}

module.exports = { enqueueMrpRun, getJobStatus };