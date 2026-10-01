'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// quotationCalculators.js
//
// Pure calculation functions for every costing template.
// Templates supported:
//   busbar             → Copper/Aluminium busbar (horizontal table)
//   landed_cost        → Stamping/CT parts with full ICC financing overlay
//   cost_breakup       → Simple RM + process + overhead (Steering Brackets style)
//   part_wise          → Customer quotation: RM + conversion + margin + P&F (Poly sheet style)
//   nomex_sheet        → Sheet-cut parts: weight-based RM + fabrication + wastage
//   revised_conversion → Assembly busbar sets with sub-parts + plating
//   laser_fabrication  → Full sheet metal: laser + special ops + bending + overheads
// ─────────────────────────────────────────────────────────────────────────────

// ─── helpers ─────────────────────────────────────────────────────────────────
const n = (v, d = 6) => Math.round((parseFloat(v) || 0) * 10 ** d) / 10 ** d;
const pct = (v) => (v > 1 ? v / 100 : v);

// ─────────────────────────────────────────────────────────────────────────────
// SAFE ENGINE EXTRACTOR
// Handles: string, {value}, {engine}, {name}, template_code inference, default
// ─────────────────────────────────────────────────────────────────────────────
function getFormulaEngine(template) {
  if (!template) {
    console.debug('[getFormulaEngine] No template provided → defaulting to busbar');
    return 'busbar';
  }

  const raw = template.formula_engine;

  // ── Already a clean string ────────────────────────────────────────────────
  if (typeof raw === 'string' && raw.trim().length > 0) {
    const engine = raw.trim().toLowerCase();
    console.debug(`[getFormulaEngine] formula_engine string: "${engine}"`);
    return engine;
  }

  // ── Stored as an object (Mongoose Mixed or bad migration) ─────────────────
  if (raw && typeof raw === 'object') {
    console.warn('[getFormulaEngine] formula_engine is an object (not a string):', JSON.stringify(raw));

    // Try common wrapper shapes
    const candidate =
      raw.value   ||  // { value: 'busbar' }
      raw.engine  ||  // { engine: 'landed_cost' }
      raw.name    ||  // { name: 'cost_breakup' }
      raw._bsontype && raw.toString?.();  // BSON Symbol edge-case

    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      console.warn(`[getFormulaEngine] Extracted engine from object property: "${candidate}"`);
      return candidate.trim().toLowerCase();
    }
  }

  // ── Infer from template_code ───────────────────────────────────────────────
  if (template.template_code) {
    const code = String(template.template_code).toLowerCase();
    console.warn(`[getFormulaEngine] Inferring engine from template_code: "${code}"`);

    if (code.includes('laser'))    return 'laser_fabrication';
    if (code.includes('landed'))   return 'landed_cost';
    if (code.includes('breakup'))  return 'cost_breakup';
    if (code.includes('part'))     return 'part_wise';
    if (code.includes('nomex'))    return 'nomex_sheet';
    if (code.includes('revised') || code.includes('conv')) return 'revised_conversion';
    if (code.includes('busbar'))   return 'busbar';
  }

  // ── Infer from template_name ──────────────────────────────────────────────
  if (template.template_name) {
    const name = String(template.template_name).toLowerCase();
    console.warn(`[getFormulaEngine] Inferring engine from template_name: "${name}"`);

    if (name.includes('laser'))            return 'laser_fabrication';
    if (name.includes('landed'))           return 'landed_cost';
    if (name.includes('breakup') || name.includes('break up')) return 'cost_breakup';
    if (name.includes('part') && name.includes('wise'))        return 'part_wise';
    if (name.includes('nomex'))            return 'nomex_sheet';
    if (name.includes('revised') || name.includes('conversion')) return 'revised_conversion';
    if (name.includes('busbar'))           return 'busbar';
  }

  // ── Final fallback ────────────────────────────────────────────────────────
  console.warn('[getFormulaEngine] Could not determine formula_engine. Defaulting to "busbar". Template:', {
    template_code: template.template_code,
    template_name: template.template_name,
    formula_engine_raw: raw,
  });
  return 'busbar';
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. BUSBAR TEMPLATE
// Matches: Busbar_cost__09_01_2026.xlsx  (Copper Busbar sheet)
// Layout: SR.NO | PartNo | T | W | L | GrossWt | RMRate | ProfileConv |
//         TotalRMRate | GrossRMCost | NetWgt | ScrapKgs | ScrapRate | ScrapCost |
//         [process cols…] | SubTotal | Margin+OH | FinalRate | Qty
// ─────────────────────────────────────────────────────────────────────────────
function calcBusbar(item, template) {
  const T       = n(item.Thickness);
  const W       = n(item.Width);
  const L       = n(item.Length);
  const density = n(item.density || 8.93);
  const grossWt = n((T * W * L * density) / 1_000_000);

  const rmRate      = n(item.rm_rate || 0);
  const profConv    = n(item.profile_conversion_rate || 0);
  const totalRMRate = n(rmRate + profConv);
  const grossRMCost = n(grossWt * totalRMRate);

  const netWt    = n(item.net_weight_kg || grossWt);
  const scrapKgs = n(Math.max(0, grossWt - netWt));
  const scrapRate = n(item.scrap_rate_per_kg || 0);
  const scrapCost = n(scrapKgs * scrapRate);

  const processCosts = (item.processes || []).map(p => ({
    name: p.process_name || p.name || 'Process',
    cost: n(p.calculated_cost || p.cost || 0),
  }));
  const totalProcessCost = n(processCosts.reduce((s, p) => s + p.cost, 0));

  const subTotal  = n(grossRMCost - scrapCost + totalProcessCost);
  const marginOH  = n(pct(item.MarginPercent || item.margin_percent || 0));
  const finalRate = n(subTotal * (1 + marginOH));
  const qty       = n(item.Quantity || 1);
  const amount    = n(finalRate * qty);

  console.debug(`[calcBusbar] ${item.PartNo}: grossWt=${grossWt} grossRMCost=${grossRMCost} scrapCost=${scrapCost} processTotal=${totalProcessCost} subTotal=${subTotal} finalRate=${finalRate}`);

  return {
    ...item,
    gross_weight_kg:   grossWt,
    total_rm_rate:     totalRMRate,
    gross_rm_cost:     grossRMCost,
    net_weight_kg:     netWt,
    scrap_kgs:         scrapKgs,
    scrap_cost:        scrapCost,
    ProcessCost:       totalProcessCost,
    process_breakdown: processCosts,
    SubTotal:          subTotal,
    MarginPercent:     marginOH * 100,
    FinalRate:         finalRate,
    Amount:            amount,
    Quantity:          qty,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. LANDED COST TEMPLATE
// Matches: CB71942_43_45_-26_12_2025.xlsx
// Vertical layout per item with full ICC financing calculation
// ─────────────────────────────────────────────────────────────────────────────
function calcLandedCost(item, template) {
  const T      = n(item.Thickness || 0);
  const W      = n(item.Width || item.strip_width || 0);
  const pitch  = n(item.pitch || item.Length || 0);
  const cavity = Math.max(1, parseInt(item.no_of_cavity || 1));
  const density = n(item.density || 8.93);

  const grossWtPerPiece  = n((T * W * pitch * density) / (1_000_000 * cavity));
  const rejPct           = n(pct(item.rm_rejection_percent || 2));
  const grossWtInclRej   = n(grossWtPerPiece * (1 + rejPct));

  const netWt        = n(item.net_weight_kg || grossWtPerPiece * 0.82);
  const scrapWt      = n(Math.max(0, grossWtInclRej - netWt));
  const scrapReal    = n(pct(item.scrap_realisation_percent || 98));
  const scrapActual  = n(scrapWt * scrapReal);

  const basicRM   = n(item.rm_rate || 0);
  const gstPct    = n(pct(item.rm_gst_pct || 18));
  const gstOnRM   = n(basicRM * gstPct);
  const profileConv = n(item.profile_conversion_rate || 0);
  const transport = n(item.transport_rate_per_kg || 0);
  const grossRMRate = n(basicRM + gstOnRM + profileConv + transport);
  const gstSetoff = n(item.use_gst_setoff !== false ? -gstOnRM : 0);
  const netRMRate = n(grossRMRate + gstSetoff);

  const grossRMCost  = n(grossWtInclRej * netRMRate);
  const scrapCredit  = n(scrapActual * n(item.scrap_rate_per_kg || 875));
  const netRMCost    = n(grossRMCost - scrapCredit);

  const iccDays  = n(item.icc_credit_on_input_days ?? template?.icc_credit_on_input_days ?? -30);
  const wipDays  = n(item.icc_wip_fg_days ?? template?.icc_wip_fg_days ?? 30);
  const crdDays  = n(item.icc_credit_given_days ?? template?.icc_credit_given_days ?? 45);
  const totalDays = n(Math.abs(iccDays) + wipDays + crdDays);
  const coc      = n(pct(item.icc_cost_of_capital ?? template?.icc_cost_of_capital ?? 0.10));
  const iccCost  = n(netRMCost * (totalDays / 365) * coc);

  const ohpMatl  = n(netRMCost * n(pct(item.ohp_percent_on_matl ?? template?.ohp_percent_on_matl ?? 0.10)));

  const processCosts = (item.processes || []).map(p => ({
    name: p.process_name || p.name || 'Process',
    cost: n(p.calculated_cost || p.cost || 0),
  }));
  const totalProcessCost = n(processCosts.reduce((s, p) => s + p.cost, 0));

  const ohpLabour     = n(totalProcessCost * n(pct(item.ohp_on_labour_pct ?? template?.ohp_on_labour_pct ?? 0.15)));
  const rejCostLabour = n(totalProcessCost * n(pct(template?.rejection_on_labour_pct ?? 0.02)));

  const packingCost   = n(item.packing_cost_per_nos   ?? template?.packing_cost_per_nos   ?? 5);
  const inspCost      = n(item.inspection_cost        ?? template?.inspection_cost        ?? 0.2);
  const toolMaintCost = n(item.tool_maintenance_cost  ?? template?.tool_maintenance_cost  ?? 0.2);
  const platingCost   = n((item.plating_cost_per_kg   ?? template?.plating_cost_per_kg   ?? 70) * grossWtPerPiece);

  const landedCostPerPiece = n(
    netRMCost + iccCost + ohpMatl +
    totalProcessCost + ohpLabour + rejCostLabour +
    packingCost + inspCost + toolMaintCost + platingCost
  );

  const qty    = n(item.Quantity || 1);
  const amount = n(landedCostPerPiece * qty);

  console.debug(`[calcLandedCost] ${item.PartNo}: netRMCost=${netRMCost} iccCost=${iccCost} processTotal=${totalProcessCost} landed=${landedCostPerPiece}`);

  return {
    ...item,
    gross_weight_kg:         grossWtPerPiece,
    gross_wt_incl_rejection: grossWtInclRej,
    net_weight_kg:           netWt,
    scrap_wt_actual:         scrapActual,
    gross_rm_rate:           grossRMRate,
    gst_setoff:              gstSetoff,
    net_rm_rate:             netRMRate,
    gross_rm_cost:           grossRMCost,
    scrap_credit:            scrapCredit,
    net_rm_cost:             netRMCost,
    icc_cost:                iccCost,
    ohp_on_material:         ohpMatl,
    ProcessCost:             totalProcessCost,
    process_breakdown:       processCosts,
    ohp_on_labour:           ohpLabour,
    rejection_cost_labour:   rejCostLabour,
    packing_cost:            packingCost,
    inspection_cost:         inspCost,
    tool_maintenance_cost:   toolMaintCost,
    plating_cost:            platingCost,
    FinalRate:               landedCostPerPiece,
    SubTotal:                landedCostPerPiece,
    Amount:                  amount,
    Quantity:                qty,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. COST BREAKUP TEMPLATE
// Matches: Steering_brackets_3191227_-_19_01_2026.xls
// Layout:
//   RM Cost = given (from laser cutting or other)
//   Processing Cost = operation rows (Mandays * rate)
//   Total = RM + Processing
//   Overheads & Profit = Total * OH%
//   Cost Per Piece = Total + Overheads
// ─────────────────────────────────────────────────────────────────────────────
function calcCostBreakup(item, template) {
  const rmCost = n(item.gross_rm_cost || item.rm_cost || 0);

  const processCosts = (item.processes || []).map(p => ({
    name:        p.process_name || p.name || 'Operation',
    operation:   p.operation   || '',
    machine:     p.machine     || '',
    days_mandays: p.days_mandays || 0,
    amount:      n(p.calculated_cost || p.cost || 0),
  }));
  const totalProcessCost = n(processCosts.reduce((s, p) => s + p.amount, 0));

  const total          = n(rmCost + totalProcessCost);
  const overheadPct    = n(pct(item.OverheadPercent || item.overhead_pct || 10));
  const overheadAmount = n(total * overheadPct);
  const costPerPiece   = n(total + overheadAmount);

  const qty    = n(item.Quantity || 1);
  const amount = n(costPerPiece * qty);

  console.debug(`[calcCostBreakup] ${item.PartNo}: rmCost=${rmCost} processTotal=${totalProcessCost} total=${total} overhead=${overheadAmount} costPerPiece=${costPerPiece}`);

  return {
    ...item,
    rm_cost:           rmCost,
    ProcessCost:       totalProcessCost,
    process_breakdown: processCosts,
    SubTotal:          total,
    OverheadPercent:   overheadPct * 100,
    OverheadAmount:    overheadAmount,
    FinalRate:         costPerPiece,
    Amount:            amount,
    Quantity:          qty,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PART-WISE COST SHEET
// Matches: Poly_sheet_-_thik__5_0_mm_-_22_02_2026.xls  &  27_01_2026___Lucy_Pvt__Ltd___.xlsx
// Layout:
//   SR NO | Part Description | Doc No | SAP No | Sheet | Rev |
//   THK | R/M SIZE | R/M TYPE | R/M COST | CONV COST | RATE/PC |
//   MARGIN | P&F | RATE/PC (final) | QTY
// ─────────────────────────────────────────────────────────────────────────────
function calcPartWise(item, template) {
  const L       = n(item.Length || 0);
  const W       = n(item.Width  || 0);
  const thk     = n(item.Thickness || 0);
  const density = n(item.density || 1.2);

  const netWt  = n(item.net_weight_kg || (L * W * thk * density) / 1_000_000);
  const rmRate = n(item.rm_rate || 0);
  const rmCost = n(netWt * rmRate);

  const convCost  = n(item.conversion_cost || item.ProcessCost || 0);
  const ratePerPc = n(rmCost + convCost);

  const marginPct = n(pct(item.MarginPercent || item.margin_pct || 0.20));
  const margin    = n(ratePerPc * marginPct);
  const pfPct     = n(pct(item.pf_pct || 0.05));
  const pf        = n(ratePerPc * pfPct);

  const finalRate = n(ratePerPc + margin + pf);
  const qty       = n(item.Quantity || 1);
  const amount    = n(finalRate * qty);

  console.debug(`[calcPartWise] ${item.PartNo}: rmCost=${rmCost} convCost=${convCost} ratePerPc=${ratePerPc} margin=${margin} pf=${pf} finalRate=${finalRate}`);

  return {
    ...item,
    net_weight_kg:   netWt,
    gross_rm_cost:   rmCost,
    conversion_cost: convCost,
    rate_per_pc:     ratePerPc,
    MarginAmount:    margin,
    pf_amount:       pf,
    FinalRate:       finalRate,
    Amount:          amount,
    Quantity:        qty,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. NOMEX SHEET MATERIAL
// Matches: Nomex_Paper_Quotation_02_02_2026.xlsx
// Layout:
//   Length | Width | Thk | Total Wt | Rate/Kg | RM Cost | Wastage |
//   Total RM | Fabrication | Total | Profit% | Total | P&F (5%) | Total |
//   Qty | Dev Cost per pc → Final Rate
// ─────────────────────────────────────────────────────────────────────────────
function calcNomexSheet(item, template) {
  const L       = n(item.Length || 0);
  const W       = n(item.Width  || 0);
  const thk     = n(item.Thickness || 0);
  const density = n(item.density || 1.0);

  const totalWt    = n((L * W * thk * density) / 1_000_000);
  const rmRate     = n(item.rm_rate || 0);
  const rmCost     = n(totalWt * rmRate);
  const wastagePct = n(pct(item.wastage_pct || 0));
  const wastage    = n(rmCost * wastagePct);
  const totalRM    = n(rmCost + wastage);

  const fabCost = n(item.fabrication_cost || item.ProcessCost || 0);
  const sub1    = n(totalRM + fabCost);

  const profitPct = n(pct(item.MarginPercent || item.profit_pct || 15));
  const profit    = n(sub1 * profitPct);
  const sub2      = n(sub1 + profit);

  const pfPct   = n(pct(item.pf_pct || 5));
  const pf      = n(sub2 * pfPct);

  const devCost   = n(item.dev_cost_per_pc || 0);
  const finalRate = n(sub2 + pf + devCost);
  const qty       = n(item.Quantity || 1);
  const amount    = n(finalRate * qty);

  console.debug(`[calcNomexSheet] ${item.PartNo}: totalWt=${totalWt} rmCost=${rmCost} wastage=${wastage} fab=${fabCost} profit=${profit} pf=${pf} finalRate=${finalRate}`);

  return {
    ...item,
    total_weight_kg:  totalWt,
    gross_rm_cost:    rmCost,
    wastage_amount:   wastage,
    total_rm_cost:    totalRM,
    fabrication_cost: fabCost,
    SubTotal_1:       sub1,
    profit_amount:    profit,
    SubTotal_2:       sub2,
    pf_amount:        pf,
    dev_cost:         devCost,
    FinalRate:        finalRate,
    Amount:           amount,
    Quantity:         qty,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. REVISED CONVERSION (Multi-Part Assembly with Plating)
// Matches: 26_02_2026-_Revised_Conversion.xlsx  &  27_01_2026___Lucy_Pvt__Ltd___.xlsx
// Layout per sub-part:
//   THK | WIDTH | LENGTH | SHEET | REV | R/M specific gravity | GROSS WGT |
//   R/M TYPE & COST (Cu Flat/Cu Sheet/Al Flat/Al Sheet) |
//   MARGIN (15%) | PLATING (TIN ON CU=75 / TIN ON AL=160 per kg) |
//   Insert & Cut Out | Discount | RATE/PC | QTY/SET | AMT/SET
// ─────────────────────────────────────────────────────────────────────────────
function calcRevisedConversion(item, template) {
  const subParts = (item.sub_parts || [item]).map(sp => {
    const T       = n(sp.Thickness || 0);
    const W       = n(sp.Width     || 0);
    const L       = n(sp.Length    || 0);
    const density = n(sp.density   || 8.9);
    const grossWt = n((T * W * L * density) / 1_000_000);

    const rmType = (sp.rm_type || 'Cu Flat').toLowerCase();

    // Pick rate from template overrides or item-level, with sensible defaults
    let rmRate;
    if      (rmType.includes('cu') && rmType.includes('sheet'))  rmRate = n(template?.cu_sheet_rate || sp.rm_rate || 1438.85);
    else if (rmType.includes('al') && rmType.includes('sheet'))  rmRate = n(template?.al_sheet_rate || sp.rm_rate || 442);
    else if (rmType.includes('al'))                              rmRate = n(template?.al_flat_rate  || sp.rm_rate || 418);
    else                                                          rmRate = n(template?.cu_flat_rate  || sp.rm_rate || 1357.85);

    const rmCost      = n(grossWt * rmRate);
    const marginPct   = n(pct(sp.MarginPercent || 15));
    const margin      = n(rmCost * marginPct);

    // Plating: TIN ON CU = Rs 75/kg, TIN ON AL = Rs 160/kg
    const platingRate = rmType.includes('al') ? 160 : 75;
    const platingCost = n(grossWt * platingRate);

    const insertCut   = n(sp.insert_cut || sp.ProcessCost || 0);

    // 10% scrap at 10% realisation = scrap credit
    const scrapCredit = n(grossWt * 0.10 * rmRate * 0.10);

    const ratePerPc = n(rmCost + margin + platingCost + insertCut - scrapCredit);
    const qtyInSet  = parseInt(sp.qty_in_set || sp.Quantity || 1);
    const amtPerSet = n(ratePerPc * qtyInSet);

    console.debug(`[calcRevisedConversion] sub-part ${sp.PartNo || sp.drawing_no}: grossWt=${grossWt} rmRate=${rmRate} rmCost=${rmCost} margin=${margin} plating=${platingCost} ratePerPc=${ratePerPc}`);

    return { ...sp, grossWt, rmCost, margin, platingCost, insertCut, scrapCredit, ratePerPc, qty_in_set: qtyInSet, amtPerSet };
  });

  const totalAmtPerSet = n(subParts.reduce((s, sp) => s + sp.amtPerSet, 0));
  const qty    = n(item.Quantity || 1);
  const amount = n(totalAmtPerSet * qty);

  return {
    ...item,
    sub_parts:  subParts,
    FinalRate:  totalAmtPerSet,
    SubTotal:   totalAmtPerSet,
    Amount:     amount,
    Quantity:   qty,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. LASER FABRICATION SHEET
// Matches: 27_02_2026__-___CC0L0005002___-.xlsx
// Columns (R3 of that sheet):
//   Drawing Spec | RM Calculation (net wt, wastage 10%, total wt, RM rate, RM cost, scrap rate, scrap calc, net mat cost) |
//   Laser MC (path mm, path sq.mm, rate/sq.mm, calc, start pts, start rate, start calc, final laser cost) |
//   Special Ops (flatning, drilling, tapping, CSK, mach/grinding/hardware) |
//   Bending | Fabrication & Powder Coat | TOTAL PROCESS COST | TOTAL PROCESS+MATERIAL |
//   Overheads: inspection 2% | rejection 2% | design/jig 2% | packaging 2% | OH&Profit 15% | transport 2%
// ─────────────────────────────────────────────────────────────────────────────
function calcLaserFabrication(item, template) {
  const L       = n(item.Length || 0);
  const W       = n(item.Width  || 0);
  const thk     = n(item.Thickness || 0);
  const density = n(item.density || 7.85);
  const qty     = parseInt(item.Quantity || 1);

  // Raw material
  const netWt      = n((L * W * thk * density) / 1_000_000);
  const wastage    = n(netWt * 0.10);               // 10% wastage
  const totalWt    = n(netWt + wastage);
  const rmRate     = n(item.rm_rate || 75);
  const rmCost     = n(totalWt * rmRate);
  const scrapRate  = n(item.scrap_rate_per_kg || 20);
  const scrapWt    = n(totalWt * 0.10);             // 10% scrap
  const scrapCredit = n(scrapWt * scrapRate);
  const netMatCost  = n(rmCost - scrapCredit);

  // Laser cutting
  const pathLengthSqMm = n(item.path_length_sq_mm || 0);
  const laserRate      = n(item.laser_rate_per_sq_mm || 0.02);
  const startPoints    = parseInt(item.start_points || 0);
  const startRate      = n(item.start_point_rate || 2.5);
  const laserCost      = n((pathLengthSqMm * laserRate) + (startPoints * startRate));

  // Special operations
  const flatningCost  = n(item.flatning_cost || 0);
  const drillingCost  = n(item.drilling_cost || 0);
  const tappingCost   = n(item.tapping_cost  || 0);
  const cskCost       = n(item.csk_cost      || 0);
  const machGrindCost = n(item.mach_grinding_cost || item.hardware_cost || 0);
  const bendingCost   = n(item.bending_cost  || 0);
  const fabCost       = n(item.fabrication_cost || item.ProcessCost || 0);

  const totalProcessCost = n(laserCost + flatningCost + drillingCost + tappingCost +
                              cskCost + machGrindCost + bendingCost + fabCost);

  const totalPlusMatCost = n(netMatCost + totalProcessCost);

  // Overheads (all applied on totalPlusMatCost — matches the actual sheet)
  const ovhPct = n(pct(template?.inspection_pct         ?? 2));
  const rejPct = n(pct(template?.rejection_pct          ?? 2));
  const dsnPct = n(pct(template?.design_jig_pct         ?? 2));
  const pkgPct = n(pct(template?.packaging_pct          ?? 2));
  const ohpPct = n(pct(template?.overhead_profit_pct    ?? 15));
  const trsPct = n(pct(template?.transportation_pct     ?? 2));

  const inspCost   = n(totalPlusMatCost * ovhPct);
  const rejCost    = n(totalPlusMatCost * rejPct);
  const designCost = n(totalPlusMatCost * dsnPct);
  const pkgCost    = n(totalPlusMatCost * pkgPct);
  const ohpCost    = n(totalPlusMatCost * ohpPct);
  const trsCost    = n(totalPlusMatCost * trsPct);
  const totalOverheads = n(inspCost + rejCost + designCost + pkgCost + ohpCost + trsCost);

  const finalCost = n(totalPlusMatCost + totalOverheads);
  const amount    = n(finalCost * qty);

  console.debug(`[calcLaserFabrication] ${item.PartNo}: netWt=${netWt} netMatCost=${netMatCost} laser=${laserCost} totalProcess=${totalProcessCost} totalPlusMat=${totalPlusMatCost} overheads=${totalOverheads} finalCost=${finalCost}`);

  return {
    ...item,
    net_weight_kg:          netWt,
    wastage_kg:             wastage,
    total_weight_kg:        totalWt,
    rm_cost:                rmCost,
    scrap_credit:           scrapCredit,
    net_material_cost:      netMatCost,
    laser_cost:             laserCost,
    flatning_cost:          flatningCost,
    drilling_cost:          drillingCost,
    tapping_cost:           tappingCost,
    csk_cost:               cskCost,
    mach_grind_cost:        machGrindCost,
    bending_cost:           bendingCost,
    fabrication_cost:       fabCost,
    ProcessCost:            totalProcessCost,
    total_process_plus_mat: totalPlusMatCost,
    inspection_cost:        inspCost,
    rejection_cost:         rejCost,
    design_jig_cost:        designCost,
    packaging_cost:         pkgCost,
    overhead_profit_cost:   ohpCost,
    transportation_cost:    trsCost,
    total_overheads:        totalOverheads,
    FinalRate:              finalCost,
    SubTotal:               totalPlusMatCost,
    Amount:                 amount,
    Quantity:               qty,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPATCHER — maps engine name → calculator function
// ─────────────────────────────────────────────────────────────────────────────
const CALCULATORS = {
  busbar:              calcBusbar,
  landed_cost:         calcLandedCost,
  cost_breakup:        calcCostBreakup,
  part_wise:           calcPartWise,
  nomex_sheet:         calcNomexSheet,
  revised_conversion:  calcRevisedConversion,
  laser_fabrication:   calcLaserFabrication,
};

function calculateItem(item, template) {
  const engine = getFormulaEngine(template);

  const calc = CALCULATORS[engine];

  if (!calc) {
    // ── Detailed error with all available info to aid debugging ───────────────
    console.error('[calculateItem] ERROR: Unknown formula_engine:', {
      resolvedEngine:   engine,
      template_code:    template?.template_code,
      template_name:    template?.template_name,
      formula_engine_raw: template?.formula_engine,
      available_engines: Object.keys(CALCULATORS),
      item_PartNo:      item?.PartNo,
    });
    throw new Error(
      `Unknown formula_engine: "${engine}". ` +
      `Available engines: [${Object.keys(CALCULATORS).join(', ')}]. ` +
      `Template: ${template?.template_code || 'unknown'} (${template?.template_name || 'unnamed'}). ` +
      `Raw formula_engine value was: ${JSON.stringify(template?.formula_engine)}`
    );
  }

  console.debug(`[calculateItem] Using engine="${engine}" for part="${item?.PartNo}" template="${template?.template_code}"`);
  return calc(item, template);
}

function calculateAllItems(items, template) {
  return items.map(item => calculateItem(item, template));
}

module.exports = {
  calculateItem,
  calculateAllItems,
  getFormulaEngine,       // exported so controller can use same logic
  calcBusbar,
  calcLandedCost,
  calcCostBreakup,
  calcPartWise,
  calcNomexSheet,
  calcRevisedConversion,
  calcLaserFabrication,
  CALCULATORS,
};