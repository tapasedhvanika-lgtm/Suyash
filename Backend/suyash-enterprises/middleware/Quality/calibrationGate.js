// middleware/Quality/calibrationGate.js
const InspectionPlan = require('../../models/Quality/InspectionPlan');
const GaugeMaster = require('../../models/Quality/GaugeMaster');

/**
 * Validates that all gauges referenced in an inspection plan
 * are currently Calibrated and not past their next_calibration_date.
 *
 * @param {string} planId - the InspectionPlan _id
 * @throws {Object} { status: 400, message, overdueGauges: [] }
 */
async function validateGaugeCalibration(planId) {
  const plan = await InspectionPlan.findById(planId).lean();
  if (!plan) {
    throw { status: 404, message: 'Inspection plan not found' };
  }

  // Collect unique gauge ObjectIds from all checkpoints
  const gaugeIds = [
    ...new Set(
      (plan.checkpoints || [])
        .filter(cp => cp.gauge_id)
        .map(cp => cp.gauge_id.toString())
    ),
  ];

  if (gaugeIds.length === 0) {
    return; // plan has no gauges — no gate
  }

  const gauges = await GaugeMaster.find({ _id: { $in: gaugeIds } }).lean();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueGauges = gauges.filter(g => {
    const isStatusBad = g.status !== 'Calibrated';
    const isDateExpired = !g.next_calibration_date || new Date(g.next_calibration_date) <= today;
    return isStatusBad || isDateExpired;
  });

  if (overdueGauges.length > 0) {
    throw {
      status: 400,
      message: 'Inspection blocked: one or more gauges are overdue for calibration',
      overdueGauges: overdueGauges.map(g => ({
        gauge_id: g.gauge_id,
        gauge_name: g.gauge_name,
        gauge_code: g.gauge_code,
        status: g.status,
        next_calibration_date: g.next_calibration_date,
      })),
    };
  }
}

module.exports = { validateGaugeCalibration };