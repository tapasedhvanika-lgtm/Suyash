'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// services/Production/mrpQueue.js
// Phase 05 — BE-018
//
// UPDATED: Added in-process fallback when Redis is unavailable.
// UPDATED: Added retryStrategy to prevent infinite Redis connection spam.
// UPDATED: Added graceful error handling for enqueueMrpRun and getJobStatus.
// ─────────────────────────────────────────────────────────────────────────────

const Queue = require('bull');

const { MrpRun } = require('../../models/Production/MrpRun');
const { runMrpJob } = require('./mrpService');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// ── Track Redis availability ──────────────────────────────────────────────────
let redisAvailable = false;
let redisChecked = false;

// ── Redis Connection Options ──────────────────────────────────────────────────
const redisOptions = {
  retryStrategy: (times) => {
    if (times > 2) {
      // Give up after 2 attempts — we'll use fallback mode
      return null;
    }
    return Math.min(times * 500, 2000);
  }
};

// ── Create Bull queue connected to Redis ──────────────────────────────────────
let mrpQueue = null;

try {
  mrpQueue = new Queue('mrp-runs', REDIS_URL, {
    redis: redisOptions,
    defaultJobOptions: {
      attempts:         2,
      backoff:          { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail:     50,
    },
  });

  // ── Worker: process one MRP job at a time ──────────────────────────────────
  mrpQueue.process('run-mrp', 1, async (job) => {
    await MrpRun.findByIdAndUpdate(job.data.mrpRunId, { status: 'Running' });
    await runMrpJob(job.data.mrpRunId, job);
  });

  // ── Queue lifecycle logs ──────────────────────────────────────────────────
  mrpQueue.on('ready', () => {
    redisAvailable = true;
    redisChecked = true;
    console.log('[MRP Queue] ✓ Connected to Redis —', REDIS_URL);
  });

  mrpQueue.on('completed', (job) => {
    console.log(`[MRP Queue] ✓ Job ${job.id} completed — MRP Run ${job.data.mrpRunId}`);
  });

  mrpQueue.on('failed', (job, err) => {
    console.error(`[MRP Queue] ✗ Job ${job.id} FAILED — MRP Run ${job.data.mrpRunId}:`, err.message);
  });

  mrpQueue.on('error', (err) => {
    // Suppress ECONNREFUSED spam — we'll fall back to in-process mode
    if (err.message.includes('ECONNREFUSED')) {
      if (!redisChecked) {
        console.warn('[MRP Queue] ⚠️ Redis unavailable — falling back to in-process MRP mode.');
        redisChecked = true;
        redisAvailable = false;
      }
    } else {
      console.error('[MRP Queue] Queue error:', err.message);
    }
  });

  mrpQueue.on('stalled', (job) => {
    console.warn(`[MRP Queue] Job ${job.id} stalled — will retry automatically`);
  });
} catch (err) {
  console.warn('[MRP Queue] ⚠️ Could not initialize Bull queue:', err.message);
  mrpQueue = null;
  redisChecked = true;
  redisAvailable = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// enqueueMrpRun
//
// If Redis is available → use Bull queue (async, scalable)
// If Redis is NOT available → run MRP directly in-process (fallback mode)
// ─────────────────────────────────────────────────────────────────────────────
async function enqueueMrpRun(mrpRunId) {
  // 1. Check if queue is ready
  let isReady = false;
  if (mrpQueue) {
    isReady = await mrpQueue.isReady().catch(() => false);
  }

  // 2. Fallback mode: Run MRP in-process (no Redis required)
  if (!isReady) {
    console.warn(`[MRP Queue] ⚠️ Redis unavailable — running MRP Run ${mrpRunId} in fallback (in-process) mode.`);

    // Fire-and-forget: don't block the HTTP response
    setImmediate(async () => {
      try {
        await MrpRun.findByIdAndUpdate(mrpRunId, { status: 'Running' });
        await runMrpJob(mrpRunId, null); // null bullJob → no progress tracking
        console.log(`[MRP Queue] ✓ Fallback job completed — MRP Run ${mrpRunId}`);
      } catch (err) {
        console.error(`[MRP Queue] ✗ Fallback job failed — MRP Run ${mrpRunId}:`, err.message);
        // Mark the run as Failed in DB
        try {
          await MrpRun.findByIdAndUpdate(mrpRunId, {
            status: 'Failed',
            log: `FALLBACK MODE FAILURE: ${err.message}`,
          });
        } catch (_) {}
      }
    });

    // Return a synthetic job ID so the controller doesn't fail
    return { jobId: `fallback-${Date.now()}`, fallback: true };
  }

  // 3. Normal mode: enqueue to Bull (Redis-backed)
  try {
    const job = await mrpQueue.add('run-mrp', { mrpRunId });
    console.log(`[MRP Queue] MRP Run ${mrpRunId} added to queue as job ${job.id}`);
    return { jobId: String(job.id) };
  } catch (error) {
    console.error(`[MRP Queue] Failed to enqueue MRP Run ${mrpRunId}:`, error.message);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getJobStatus
// ─────────────────────────────────────────────────────────────────────────────
async function getJobStatus(jobId) {
  try {
    // If it's a fallback job, we can't track it via Redis
    if (typeof jobId === 'string' && jobId.startsWith('fallback-')) {
      return {
        state: 'unknown',
        note:  'Running in fallback (in-process) mode — check MRP Run status in DB',
      };
    }

    if (!mrpQueue) {
      return { state: 'unknown', note: 'Queue not initialized' };
    }

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
      state,
      progress,
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