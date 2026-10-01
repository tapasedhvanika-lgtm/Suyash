// jobs/calibrationCron.js
const cron = require('node-cron');
const GaugeMaster = require('../models/Quality/GaugeMaster');
//const Notification = require('../models/Common/Notification'); // Create if needed

/**
 * Daily cron job (runs at 8:00 AM every day)
 * 1. Updates gauge status from Calibrated → Overdue when next_calibration_date < today
 * 2. Generates calibration due alerts for gauges due in next 30 days
 */
async function updateCalibrationStatus() {
  console.log('[CRON] Running calibration status update...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Mark overdue gauges
  const overdueResult = await GaugeMaster.updateMany(
    {
      status: 'Calibrated',
      next_calibration_date: { $lt: today },
      is_active: true,
    },
    {
      $set: { status: 'Overdue' },
    }
  );

  console.log(`[CRON] Marked ${overdueResult.modifiedCount} gauges as Overdue`);

  // 2. Find gauges due in next 30 days for alerts
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);

  const dueSoon = await GaugeMaster.find({
    status: 'Calibrated',
    next_calibration_date: { $gte: today, $lte: thirtyDaysLater },
    is_active: true,
  }).populate('custodian_id', 'name email');

  console.log(`[CRON] ${dueSoon.length} gauges due for calibration in next 30 days`);

  // 3. Create notifications for each due gauge (if notification system exists)
  for (const gauge of dueSoon) {
    const daysLeft = Math.ceil(
      (new Date(gauge.next_calibration_date) - today) / (1000 * 60 * 60 * 24)
    );

    console.log(
      `[CRON] ALERT: Gauge ${gauge.gauge_code} (${gauge.gauge_name}) due in ${daysLeft} days`
    );

    // Create notification record
    // await Notification.create({ ... });
  }

  return {
    overdue_count: overdueResult.modifiedCount,
    due_soon_count: dueSoon.length,
    due_soon_gauges: dueSoon.map(g => ({
      gauge_code: g.gauge_code,
      gauge_name: g.gauge_name,
      days_left: Math.ceil((new Date(g.next_calibration_date) - today) / (1000 * 60 * 60 * 24)),
    })),
  };
}

// Schedule cron job to run daily at 8:00 AM
// For testing: '*/5 * * * *' (every 5 minutes)
// For production: '0 8 * * *' (8:00 AM daily)
cron.schedule('0 8 * * *', async () => {
  try {
    const result = await updateCalibrationStatus();
    console.log('[CRON] Calibration check completed:', result);
  } catch (error) {
    console.error('[CRON] Calibration check failed:', error);
  }
});

module.exports = { updateCalibrationStatus };