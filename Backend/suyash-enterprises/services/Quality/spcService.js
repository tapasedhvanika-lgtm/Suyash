const SpcData = require('../../models/Quality/SpcData');

/**
 * Western Electric rules applied to the subgroups array.
 * Returns { violated: true/false, rule: 'Rule1'|'Rule2'|'Rule3'|'Rule4' }
 */
function checkWesternElectricRules(subgroups, ucl, lcl, centerLine) {
  const n = subgroups.length;
  if (n === 0) return { violated: false };

  const xbars = subgroups.map(s => s.x_bar);
  const sigma = ucl && centerLine ? (ucl - centerLine) / 3 : null;
  if (!sigma) return { violated: false };

  const latest = xbars[n - 1];

  // Rule 1: 1 point beyond 3σ
  if (latest > ucl || latest < lcl) return { violated: true, rule: 'Rule1' };

  // Rule 2: 9 consecutive points same side of center line
  if (n >= 9) {
    const last9 = xbars.slice(-9);
    const allAbove = last9.every(v => v > centerLine);
    const allBelow = last9.every(v => v < centerLine);
    if (allAbove || allBelow) return { violated: true, rule: 'Rule2' };
  }

  // Rule 3: 6 consecutive points trending up or down
  if (n >= 6) {
    const last6 = xbars.slice(-6);
    const trendingUp = last6.every((v, i) => i === 0 || v > last6[i - 1]);
    const trendingDown = last6.every((v, i) => i === 0 || v < last6[i - 1]);
    if (trendingUp || trendingDown) return { violated: true, rule: 'Rule3' };
  }

  // Rule 4: 2 of 3 consecutive points beyond 2σ on the same side
  if (n >= 3) {
    const last3 = xbars.slice(-3);
    const twoSigmaHigh = centerLine + 2 * sigma;
    const twoSigmaLow = centerLine - 2 * sigma;
    const beyondHigh = last3.filter(v => v > twoSigmaHigh).length;
    const beyondLow = last3.filter(v => v < twoSigmaLow).length;
    if (beyondHigh >= 2 || beyondLow >= 2) return { violated: true, rule: 'Rule4' };
  }

  return { violated: false };
}

/**
 * Computes control limits once we have >= 25 subgroups.
 * Uses X-bar R method.
 */
function computeControlLimits(subgroups) {
  if (subgroups.length < 25) return null;
  const xbars = subgroups.map(s => s.x_bar);
  const ranges = subgroups.map(s => s.r_value);
  const xDoubleBar = xbars.reduce((a, b) => a + b, 0) / xbars.length;
  const rBar = ranges.reduce((a, b) => a + b, 0) / ranges.length;

  // A2 constant for subgroup size 5
  const A2 = 0.577;
  const D3 = 0;
  const D4 = 2.114;

  return {
    center_line: parseFloat(xDoubleBar.toFixed(4)),
    ucl: parseFloat((xDoubleBar + A2 * rBar).toFixed(4)),
    lcl: parseFloat((xDoubleBar - A2 * rBar).toFixed(4)),
    r_ucl: parseFloat((D4 * rBar).toFixed(4)),
    r_lcl: parseFloat((D3 * rBar).toFixed(4)),
  };
}

/**
 * Computes Cp and Cpk from USL, LSL, and subgroups.
 */
function computeCapability(subgroups, usl, lsl) {
  if (!usl || !lsl || subgroups.length < 25) return {};
  const xbars = subgroups.map(s => s.x_bar);
  const ranges = subgroups.map(s => s.r_value);
  const xDoubleBar = xbars.reduce((a, b) => a + b, 0) / xbars.length;
  const rBar = ranges.reduce((a, b) => a + b, 0) / ranges.length;
  const d2 = 2.326; // for subgroup size 5
  const sigmaEst = rBar / d2;

  if (sigmaEst === 0) return {};
  const cp = parseFloat(((usl - lsl) / (6 * sigmaEst)).toFixed(4));
  const cpu = (usl - xDoubleBar) / (3 * sigmaEst);
  const cpl = (xDoubleBar - lsl) / (3 * sigmaEst);
  const cpk = parseFloat(Math.min(cpu, cpl).toFixed(4));
  const capabilityStatus =
    cpk >= 1.33 ? 'Capable' : cpk >= 1.0 ? 'Marginally Capable' : 'Incapable';

  return { cp, cpk, capability_status: capabilityStatus };
}

/**
 * Adds a subgroup to the SPC record for a given item+checkpoint.
 * Creates the SPC record if it doesn't exist yet.
 * Returns { spcRecord, oocAlert }
 */
async function addSpcSubgroup({ item_id, plan_id, checkpoint_seq, characteristic,
  control_chart_type, usl, lsl, target, subgroup_size, readings, inspection_record_id }) {
  let spcRecord = await SpcData.findOne({ item_id, checkpoint_seq });

  const avg = readings.reduce((a, b) => a + b, 0) / readings.length;
  const range = Math.max(...readings) - Math.min(...readings);

  const newSubgroup = {
    timestamp: new Date(),
    inspection_record_id,
    readings,
    x_bar: parseFloat(avg.toFixed(4)),
    r_value: parseFloat(range.toFixed(4)),
    is_ooc: false,
    ooc_rule: null,
  };

  if (!spcRecord) {
    spcRecord = new SpcData({
      item_id, plan_id, checkpoint_seq, characteristic,
      control_chart_type, usl, lsl, target, subgroup_size,
      subgroups: [newSubgroup],
    });
  } else {
    spcRecord.subgroups.push(newSubgroup);
  }

  // Recompute control limits if enough data
  const limits = computeControlLimits(spcRecord.subgroups);
  if (limits) {
    spcRecord.ucl = limits.ucl;
    spcRecord.lcl = limits.lcl;
    spcRecord.center_line = limits.center_line;
    const capability = computeCapability(spcRecord.subgroups, usl, lsl);
    Object.assign(spcRecord, capability);
  }

  // Check Western Electric rules
  let oocAlert = null;
  if (spcRecord.ucl && spcRecord.lcl) {
    const weResult = checkWesternElectricRules(
      spcRecord.subgroups, spcRecord.ucl, spcRecord.lcl, spcRecord.center_line
    );
    if (weResult.violated) {
      const lastIdx = spcRecord.subgroups.length - 1;
      spcRecord.subgroups[lastIdx].is_ooc = true;
      spcRecord.subgroups[lastIdx].ooc_rule = weResult.rule;
      oocAlert = {
        characteristic,
        rule: weResult.rule,
        x_bar: newSubgroup.x_bar,
        ucl: spcRecord.ucl,
        lcl: spcRecord.lcl,
      };
    }
  }

  spcRecord.last_updated = new Date();
  await spcRecord.save();

  return { spcRecord, oocAlert };
}

module.exports = { addSpcSubgroup, checkWesternElectricRules };