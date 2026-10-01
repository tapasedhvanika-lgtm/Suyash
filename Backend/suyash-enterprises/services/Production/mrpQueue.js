'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// services/Production/mrpQueue.js
// Phase 05 — BE-018
//
// REQUIREMENT: "implement as async job (queue with Bull/BullMQ);
//               return job_id immediately;
//               poll status via GET /api/mrp/runs/:id/status"
//
// REQUIRES: Redis running at REDIS_URL (default: redis://127.0.0.1:6379)
// Install Redis on Windows: https://github.com/microsoftarchive/redis/releases
// Verify: redis-cli ping  →  should return PONG
// ─────────────────────────────────────────────────────────────────────────────

const Queue = require('bull');
const path = require('path');

// ✅ FIX 1: Move requires to the TOP (outside the worker function)
const { MrpRun } = require('../../models/Production/MrpRun');
const { runMrpJob } = require('./mrpService');  // Note: './mrpService' not '../../services/Production/mrpService'

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// ── Create Bull queue connected to Redis ──────────────────────────────────────
const mrpQueue = new Queue('mrp-runs', REDIS_URL, {
  defaultJobOptions: {
    attempts:         2,                              // retry once on failure
    backoff:          { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,                            // keep last 100 completed jobs
    removeOnFail:     50,                             // keep last 50 failed jobs
  },
});

// ── Worker: process one MRP job at a time (CPU intensive) ────────────────────
mrpQueue.process('run-mrp', 1, async (job) => {
  // ✅ FIX 2: No require statements here anymore - use the imported modules
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

mrpQueue.on('error', (err) => {
  console.error('[MRP Queue] Queue error (is Redis running?):', err.message);
});

mrpQueue.on('stalled', (job) => {
  console.warn(`[MRP Queue] Job ${job.id} stalled — will retry automatically`);
});

// ─────────────────────────────────────────────────────────────────────────────
// enqueueMrpRun
//
// Called by: POST /api/mrp/run controller
// After:     MrpRun document saved to MongoDB with status = 'Queued'
// Returns:   { jobId } immediately — controller sends 202 response right away
// Then:      Bull worker picks up job from Redis and calls runMrpJob()
// ─────────────────────────────────────────────────────────────────────────────
async function enqueueMrpRun(mrpRunId) {
  const job = await mrpQueue.add(
    'run-mrp',
    { mrpRunId },
  );
  console.log(`[MRP Queue] MRP Run ${mrpRunId} added to queue as job ${job.id}`);
  return { jobId: String(job.id) };
}

// ─────────────────────────────────────────────────────────────────────────────
// getJobStatus
//
// Called by: GET /api/mrp/runs/:id/status controller
// Returns Bull job state:
//   waiting   — job is in queue, not yet picked up
//   active    — job is currently being processed (MRP is running)
//   completed — job finished successfully
//   failed    — job failed (check failedReason)
//   delayed   — job is waiting for retry after failure
//   unknown   — job not found in queue (may have been cleaned up)
// ─────────────────────────────────────────────────────────────────────────────
async function getJobStatus(jobId) {
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
    progress,       // 0-100 (incremented by mrpService as it processes items)
    failedReason: job.failedReason || null,
  };
}

module.exports = { enqueueMrpRun, getJobStatus };