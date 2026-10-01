'use strict';

/**
 * ANSI/ASQ Z1.4-2008 (formerly MIL-STD-105E)
 * Single sampling plans — Normal Inspection Level II
 */

// ── Sample Size Code Letters ──────────────────────────────────────────────────
const LOT_RANGES = [
  { max: 8,       code: 'A' },
  { max: 15,      code: 'B' },
  { max: 25,      code: 'C' },
  { max: 50,      code: 'D' },
  { max: 90,      code: 'E' },
  { max: 150,     code: 'F' },
  { max: 280,     code: 'G' },
  { max: 500,     code: 'H' },
  { max: 1200,    code: 'J' },
  { max: 3200,    code: 'K' },
  { max: 10000,   code: 'L' },
  { max: 35000,   code: 'M' },
  { max: 150000,  code: 'N' },
  { max: 500000,  code: 'P' },
  { max: Infinity, code: 'Q' },
];

const CODE_ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q'];

const SAMPLE_SIZES = {
  A: 2,    B: 3,   C: 5,   D: 8,   E: 13,  F: 20,  G: 32,
  H: 50,   J: 80,  K: 125, L: 200, M: 315, N: 500, P: 800, Q: 1250,
};

// Acceptance [Ac, Re] numbers per AQL level per code letter
// Keys are canonical strings: '0.065', '0.10', …, '6.5'
const AQL_TABLES = {
  '0.065': { A:[0,1],B:[0,1],C:[0,1],D:[0,1],E:[0,1],F:[0,1],G:[0,1],H:[0,1],J:[0,1],K:[0,1],L:[0,1],M:[1,2],N:[1,2],P:[2,3],Q:[3,4] },
  '0.10':  { A:[0,1],B:[0,1],C:[0,1],D:[0,1],E:[0,1],F:[0,1],G:[0,1],H:[0,1],J:[0,1],K:[0,1],L:[1,2],M:[2,3],N:[3,4],P:[5,6],Q:[7,8] },
  '0.15':  { A:[0,1],B:[0,1],C:[0,1],D:[0,1],E:[0,1],F:[0,1],G:[0,1],H:[0,1],J:[0,1],K:[1,2],L:[1,2],M:[2,3],N:[4,5],P:[6,7],Q:[10,11] },
  '0.25':  { A:[0,1],B:[0,1],C:[0,1],D:[0,1],E:[0,1],F:[0,1],G:[0,1],H:[0,1],J:[1,2],K:[1,2],L:[2,3],M:[3,4],N:[6,7],P:[9,10],Q:[14,15] },
  '0.40':  { A:[0,1],B:[0,1],C:[0,1],D:[0,1],E:[0,1],F:[0,1],G:[0,1],H:[1,2],J:[1,2],K:[2,3],L:[3,4],M:[5,6],N:[9,10],P:[14,15],Q:[21,22] },
  '0.65':  { A:[0,1],B:[0,1],C:[0,1],D:[0,1],E:[0,1],F:[0,1],G:[1,2],H:[1,2],J:[2,3],K:[3,4],L:[5,6],M:[7,8],N:[12,13],P:[18,19],Q:[29,30] },
  '1.0':   { A:[0,1],B:[0,1],C:[0,1],D:[0,1],E:[0,1],F:[1,2],G:[1,2],H:[2,3],J:[3,4],K:[5,6],L:[7,8],M:[11,12],N:[18,19],P:[28,29],Q:[44,45] },
  '1.5':   { A:[0,1],B:[0,1],C:[0,1],D:[0,1],E:[1,2],F:[1,2],G:[2,3],H:[3,4],J:[5,6],K:[7,8],L:[10,11],M:[15,16],N:[26,27],P:[41,42],Q:[65,66] },
  '2.5':   { A:[0,1],B:[0,1],C:[0,1],D:[1,2],E:[1,2],F:[2,3],G:[3,4],H:[5,6],J:[7,8],K:[10,11],L:[14,15],M:[21,22],N:[36,37],P:[58,59],Q:[92,93] },
  '4.0':   { A:[0,1],B:[0,1],C:[1,2],D:[1,2],E:[2,3],F:[3,4],G:[5,6],H:[7,8],J:[10,11],K:[14,15],L:[21,22],M:[31,32],N:[51,52],P:[80,81],Q:[127,128] },
  '6.5':   { A:[0,1],B:[1,2],C:[1,2],D:[2,3],E:[3,4],F:[5,6],G:[7,8],H:[10,11],J:[14,15],K:[21,22],L:[29,30],M:[43,44],N:[72,73],P:[112,113],Q:[177,178] },
};

// Canonical AQL level strings — handles numeric inputs like 1, 1.0, 2.5, "2.5", etc.
const VALID_AQL_LEVELS = Object.keys(AQL_TABLES);

/**
 * Normalise aql_level to its canonical table key string.
 * Accepts: 1, 1.0, "1", "1.0", "2.5" → "1.0" / "2.5" etc.
 */
function normaliseAQL(aqlLevel) {
  const str = String(aqlLevel).trim();
  // Direct match
  if (AQL_TABLES[str]) return str;
  // Numeric match: e.g. "1" → "1.0"
  const num = parseFloat(str);
  if (isNaN(num)) return null;
  for (const key of VALID_AQL_LEVELS) {
    if (parseFloat(key) === num) return key;
  }
  return null;
}

/**
 * Resolve sample size code based on lot size and inspection level.
 */
function getSampleSizeCode(lotSize, inspectionLevel = 'II') {
  const entry = LOT_RANGES.find(r => lotSize <= r.max);
  let code = entry ? entry.code : 'Q';

  const idx = CODE_ORDER.indexOf(code);
  if (inspectionLevel === 'I'   && idx > 0)                       code = CODE_ORDER[idx - 1];
  if (inspectionLevel === 'III' && idx < CODE_ORDER.length - 1)   code = CODE_ORDER[idx + 1];

  return code;
}

/**
 * Get AQL sampling plan.
 *
 * @param {number} lotSize
 * @param {string|number} aqlLevel  - e.g. '2.5', 2.5, '1.0', 1
 * @param {string} inspectionLevel  - 'I' | 'II' | 'III'
 * @returns {{ sampleSize, acceptNumber, rejectNumber, sampleCode, isHundredPercent }}
 */
function getAQLPlan(lotSize, aqlLevel, inspectionLevel = 'II') {
  const normAQL = normaliseAQL(aqlLevel);
  if (!normAQL) {
    throw new Error(
      `Invalid AQL level: "${aqlLevel}". Valid values: ${VALID_AQL_LEVELS.join(', ')}`,
    );
  }

  const code       = getSampleSizeCode(lotSize, inspectionLevel);
  const sampleSize = SAMPLE_SIZES[code];
  const acRe       = AQL_TABLES[normAQL][code];

  if (!acRe) {
    // Fallback: 100% inspection for very small lots
    return {
      sampleSize:        lotSize,
      acceptNumber:      0,
      rejectNumber:      1,
      sampleCode:        code,
      isHundredPercent:  true,
    };
  }

  return {
    sampleSize:        Math.min(sampleSize, lotSize),
    acceptNumber:      acRe[0],
    rejectNumber:      acRe[1],
    sampleCode:        code,
    isHundredPercent:  sampleSize >= lotSize,
  };
}

/**
 * Determine inspection result based on actual defect count.
 */
function getInspectionResult(defectCount, acceptNumber, rejectNumber) {
  if (defectCount <= acceptNumber) {
    return {
      result:  'Accepted',
      message: `Defects (${defectCount}) ≤ Accept number (${acceptNumber}) — Lot accepted.`,
    };
  }
  if (defectCount >= rejectNumber) {
    return {
      result:  'Rejected',
      message: `Defects (${defectCount}) ≥ Reject number (${rejectNumber}) — Lot rejected.`,
    };
  }
  return {
    result:  'Conditionally Accepted',
    message: `Defects (${defectCount}) between Ac(${acceptNumber}) and Re(${rejectNumber}) — Requires MRB review.`,
  };
}

module.exports = {
  getAQLPlan,
  getInspectionResult,
  SAMPLE_SIZES,
  AQL_TABLES,
  VALID_AQL_LEVELS,
};
