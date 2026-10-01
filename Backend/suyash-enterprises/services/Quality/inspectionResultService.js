// services/Quality/inspectionResultService.js
const WorkOrder = require('../../models/Production/WorkOrder');

/**
 * Computes overall_result from checkpoint results.
 * Priority: any critical fail → Rejected
 *           all pass → Accepted
 *           non-critical fail only → Conditionally Accepted
 */
function computeOverallResult(checkpointResults) {
  const criticalFail = checkpointResults.some(
    cp => cp.result === 'Fail' && cp.is_critical === true
  );
  if (criticalFail) return 'Rejected';

  const anyFail = checkpointResults.some(cp => cp.result === 'Fail');
  if (anyFail) return 'Conditionally Accepted';

  return 'Accepted';
}

/**
 * For each checkpoint result, computes:
 * - average_reading, min_reading, max_reading
 * - within_spec (true if average is within LSL–USL)
 * - result (Pass/Fail/Observation)
 */
function enrichCheckpointResult(cp) {
  const readings = cp.readings || [];
  const avg = readings.length
    ? readings.reduce((a, b) => a + b, 0) / readings.length
    : null;
  const withinSpec =
    avg !== null &&
    (cp.lsl === undefined || avg >= cp.lsl) &&
    (cp.usl === undefined || avg <= cp.usl);

  return {
    ...cp,
    average_reading: avg !== null ? parseFloat(avg.toFixed(4)) : null,
    min_reading: readings.length ? Math.min(...readings) : null,
    max_reading: readings.length ? Math.max(...readings) : null,
    within_spec: withinSpec,
    result: avg === null ? 'Observation' : withinSpec ? 'Pass' : 'Fail',
  };
}

/**
 * If FAI passes, sets first_article_approved on the WO operation.
 * FIXED: Using correct field name 'op_sequence'
 */
async function handleFAIGate(woId, opSequence, overallResult) {
  if (overallResult !== 'Accepted') return;

  const result = await WorkOrder.findByIdAndUpdate(
    woId,
    { $set: { 'operations.$[op].first_article_approved': true } },
    { arrayFilters: [{ 'op.op_sequence': opSequence }] }
  );

  if (result) {
    console.log(`[FAI Gate] Operation ${opSequence} on WO ${woId} approved for bulk production`);
  }
}

/**
 * If Final inspection passes, sets can_complete = true on WO.
 */
async function handleFinalGate(woId, overallResult) {
  if (overallResult !== 'Accepted') return;

  const result = await WorkOrder.findByIdAndUpdate(woId, { can_complete: true });

  if (result) {
    console.log(`[Final Gate] WO ${woId} can now be completed`);
  }
}

module.exports = {
  computeOverallResult,
  enrichCheckpointResult,
  handleFAIGate,
  handleFinalGate,
};