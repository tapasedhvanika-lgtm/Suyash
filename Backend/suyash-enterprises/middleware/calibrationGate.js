'use strict';
/**
 * middleware/calibrationGate.js
 *
 * validateGaugeCalibration(inspection_plan_id)
 * ─────────────────────────────────────────────
 * Hard-blocks inspection start if ANY gauge in the plan is Overdue
 * or Out of Service.  Admin can override with a written reason only.
 *
 * Usage in a route:
 *   const { calibrationGateMiddleware } = require('../middleware/calibrationGate');
 *   router.post('/api/inspection-records', calibrationGateMiddleware, createInspectionRecord);
 */

const mongoose      = require('mongoose');
const InspectionPlan = require('../models/Quality/InspectionPlan');
const Gauge          = require('../models/Quality/Gauge');

// ─── Core validator (reusable by controller AND middleware) ───────────────────
/**
 * @param {string|ObjectId} inspectionPlanId
 * @returns {{ passed: boolean, failedGauges: Array }}
 */
async function validateGaugeCalibration(inspectionPlanId) {
  const plan = await InspectionPlan.findById(inspectionPlanId).lean();
  if (!plan) throw new Error(`Inspection Plan ${inspectionPlanId} not found`);

  const gaugeIds = plan.checkpoints
    .filter(cp => cp.gauge_id)
    .map(cp => cp.gauge_id);

  if (gaugeIds.length === 0) return { passed: true, failedGauges: [] };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const gauges = await Gauge.find({ _id: { $in: gaugeIds } }).lean();
  const gaugeMap = Object.fromEntries(gauges.map(g => [String(g._id), g]));

  const failedGauges = [];

  for (const cp of plan.checkpoints) {
    if (!cp.gauge_id) continue;
    const gauge = gaugeMap[String(cp.gauge_id)];

    if (!gauge) {
      failedGauges.push({
        characteristic_name: cp.characteristic_name,
        gauge_id: cp.gauge_id,
        reason: 'Gauge not found in Gauge Master',
      });
      continue;
    }

    const isOverdue = gauge.status !== 'Calibrated';
    const isExpired = !gauge.next_calibration_date || new Date(gauge.next_calibration_date) <= today;

    if (isOverdue || isExpired) {
      failedGauges.push({
        characteristic_name: cp.characteristic_name,
        gauge_id:            cp.gauge_id,
        gauge_name:          gauge.name,
        gauge_status:        gauge.status,
        next_calibration_date: gauge.next_calibration_date,
        reason: isOverdue
          ? `Gauge status is "${gauge.status}" (must be Calibrated)`
          : `Gauge calibration expired on ${gauge.next_calibration_date?.toISOString?.().split('T')[0]}`,
      });
    }
  }

  return { passed: failedGauges.length === 0, failedGauges };
}

// ─── Express middleware ───────────────────────────────────────────────────────
/**
 * Expects req.body.inspection_plan_id.
 * Admin role can bypass with req.body.calibration_override_reason.
 */
async function calibrationGateMiddleware(req, res, next) {
  try {
    const { inspection_plan_id, calibration_override_reason } = req.body;

    if (!inspection_plan_id) {
      return res.status(400).json({ success: false, message: 'inspection_plan_id is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(inspection_plan_id)) {
      return res.status(400).json({ success: false, message: 'Invalid inspection_plan_id' });
    }

    const { passed, failedGauges } = await validateGaugeCalibration(inspection_plan_id);

    if (passed) return next();

    // Admin override path
    if (req.user?.role === 'Admin' && calibration_override_reason?.trim?.()?.length >= 10) {
      console.warn(
        `[CalibrationGate] ADMIN OVERRIDE by ${req.user._id}: ` +
        `${failedGauges.length} overdue gauges bypassed. Reason: ${calibration_override_reason}`
      );
      // Attach override info to request for audit logging in the controller
      req.calibrationOverride = {
        by:     req.user._id,
        reason: calibration_override_reason.trim(),
        gauges: failedGauges,
      };
      return next();
    }

    // Hard block
    return res.status(400).json({
      success: false,
      message: `Inspection blocked: ${failedGauges.length} gauge(s) are overdue or out of service.`,
      failed_gauges: failedGauges,
      hint: 'Admin can bypass by supplying calibration_override_reason (min 10 chars).',
    });

  } catch (e) {
    console.error('[calibrationGateMiddleware] Error:', e);
    return res.status(500).json({ success: false, message: e.message });
  }
}

module.exports = { validateGaugeCalibration, calibrationGateMiddleware };