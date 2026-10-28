
'use strict';

// services/Production/mrpQueue.js
// Phase 05 — BE-018
// Redis-backed MRP queue with in-process fallback.

const Queue = require('bull');

const { MrpRun } = require('../../models/Production/MrpRun');
const { runMrpJob } = require('./mrpService');

const REDIS_URL =
  process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const QUEUE_NAME = 'mrp-runs';

let mrpQueue = null;
let redisAvailable = false;
let redisUnavailable = false;

// ── Redis connection options ────────────────────────────────────────────────
const redisOptions = {
  retryStrategy: (times) => {
    // Retry briefly, then stop retrying this connection.
    if (times > 2) {
      redisUnavailable = true;
      redisAvailable = false;
      return null;
    }

    return Math.min(times * 500, 2000);
  }
};

// ── Initialize Bull queue ───────────────────────────────────────────────────
try {
  mrpQueue = new Queue(QUEUE_NAME, REDIS_URL, {
    redis: redisOptions,
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      removeOnComplete: 100,
      removeOnFail: 50
    }
  });

  // Process one MRP job at a time.
  mrpQueue.process('run-mrp', 1, async (job) => {
    await MrpRun.findByIdAndUpdate(job.data.mrpRunId, {
      status: 'Running'
    });

    await runMrpJob(job.data.mrpRunId, job);
  });

  // Redis connection established.
  mrpQueue.on('ready', () => {
    redisAvailable = true;
    redisUnavailable = false;

    console.log('[MRP Queue] Connected to Redis:', REDIS_URL);
  });

  // Redis connection lost or queue error.
  mrpQueue.on('error', (err) => {
    redisAvailable = false;

    if (
      err.code === 'ECONNREFUSED' ||
      err.message.includes('ECONNREFUSED')
    ) {
      if (!redisUnavailable) {
        console.warn(
          '[MRP Queue] Redis unavailable. ' +
          'MRP requests will use in-process fallback when possible.'
        );
      }

      redisUnavailable = true;
      return;
    }

    console.error('[MRP Queue] Redis queue error:', err.message);
  });

  mrpQueue.on('completed', (job) => {
    console.log(
      `[MRP Queue] Job ${job.id} completed — MRP Run ${job.data.mrpRunId}`
    );
  });

  mrpQueue.on('failed', (job, err) => {
    console.error(
      `[MRP Queue] Job ${job ? job.id : 'unknown'} failed:`,
      err.message
    );
  });

  mrpQueue.on('stalled', (job) => {
    console.warn(
      `[MRP Queue] Job ${job.id} stalled and may be retried`
    );
  });

} catch (err) {
  console.warn(
    '[MRP Queue] Could not initialize Bull queue:',
    err.message
  );

  mrpQueue = null;
  redisUnavailable = true;
}

// ── Run MRP without Redis ───────────────────────────────────────────────────
async function runMrpFallback(mrpRunId) {
  try {
    await MrpRun.findByIdAndUpdate(mrpRunId, {
      status: 'Running'
    });

    await runMrpJob(mrpRunId, null);

    console.log(
      `[MRP Queue] Fallback job completed — MRP Run ${mrpRunId}`
    );
  } catch (err) {
    console.error(
      `[MRP Queue] Fallback job failed — MRP Run ${mrpRunId}:`,
      err.message
    );

    try {
      await MrpRun.findByIdAndUpdate(mrpRunId, {
        status: 'Failed',
        log: `FALLBACK MODE FAILURE: ${err.message}`
      });
    } catch (dbError) {
      console.error(
        '[MRP Queue] Failed to update MRP status:',
        dbError.message
      );
    }
  }
}

// ── Enqueue MRP run ─────────────────────────────────────────────────────────
async function enqueueMrpRun(mrpRunId) {
  let isReady = false;

  if (mrpQueue && !redisUnavailable) {
    try {
      await mrpQueue.isReady();
      isReady = redisAvailable;
    } catch (err) {
      redisAvailable = false;
      redisUnavailable = true;

      console.warn(
        '[MRP Queue] Redis unavailable:',
        err.message
      );
    }
  }

  // No Redis: run directly in this Node.js process.
  if (!isReady) {
    console.warn(
      `[MRP Queue] Running MRP Run ${mrpRunId} in fallback mode`
    );

    setImmediate(() => {
      runMrpFallback(mrpRunId);
    });

    return {
      jobId: `fallback-${Date.now()}`,
      fallback: true
    };
  }

  // Redis available: use Bull.
  try {
    const job = await mrpQueue.add('run-mrp', {
      mrpRunId
    });

    console.log(
      `[MRP Queue] MRP Run ${mrpRunId} queued as job ${job.id}`
    );

    return {
      jobId: String(job.id),
      fallback: false
    };
  } catch (err) {
    console.error(
      '[MRP Queue] Failed to enqueue MRP run:',
      err.message
    );

    throw err;
  }
}

// ── Get job status ──────────────────────────────────────────────────────────
async function getJobStatus(jobId) {
  try {
    if (
      typeof jobId === 'string' &&
      jobId.startsWith('fallback-')
    ) {
      return {
        state: 'unknown',
        note: 'Fallback jobs cannot be tracked by Bull. Check the MRP Run status in MongoDB.'
      };
    }

    if (!mrpQueue || !redisAvailable) {
      return {
        state: 'unknown',
        note: 'Redis is not connected. Queue status is unavailable.'
      };
    }

    const job = await mrpQueue.getJob(jobId);

    if (!job) {
      return {
        state: 'unknown',
        note: 'Job not found in the queue.'
      };
    }

    return {
      state: await job.getState(),
      progress: job.progress(),
      failedReason: job.failedReason || null
    };
  } catch (err) {
    console.error(
      `[MRP Queue] Failed to get job status for ${jobId}:`,
      err.message
    );

    return {
      state: 'error',
      note: `Failed to fetch job status: ${err.message}`
    };
  }
}

module.exports = {
  enqueueMrpRun,
  getJobStatus
};
