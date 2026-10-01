'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// services/mrpService.js
// Phase 05 — BE-018
// Core MRP calculation: BOM explosion → stock netting → PR/WO auto-creation
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');
const { MrpRun } = require('../../models/Production/MrpRun');
const { WorkOrder } = require('../../models/Production/WorkOrder');

// ✅ Import models directly to ensure they're registered
const Bom = require('../../models/BOM/Bom');  // ← Add this import
// If you have Routing model, uncomment below:
// const Routing = require('../../models/BOM/Routing');

// ─── Lazy-load other models (avoid circular deps) ────────────────────────────
const getModel = (name) => {
  try {
    return mongoose.model(name);
  } catch (err) {
    console.error(`Model "${name}" not found:`, err.message);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ENTRY — called by Bull queue worker (or in-process fallback)
// ─────────────────────────────────────────────────────────────────────────────
async function runMrpJob(mrpRunId, bullJob) {
  const run = await MrpRun.findById(mrpRunId);
  if (!run) throw new Error(`MrpRun ${mrpRunId} not found`);

  const logLines = [];
  const log = (msg) => {
    logLines.push(`[${new Date().toISOString()}] ${msg}`);
    if (bullJob) bullJob.progress(logLines.length).catch(() => {});
  };

  try {
    run.status = 'Running';
    await run.save();

    log(`MRP Run started — type: ${run.run_type}, horizon: ${run.planning_horizon} days`);

    // ── Step 1: collect confirmed SOs within planning horizon ────────────────
    const horizonDate = new Date();
    horizonDate.setDate(horizonDate.getDate() + run.planning_horizon);

    const SalesOrder = getModel('SalesOrder');
    if (!SalesOrder) throw new Error('SalesOrder model not found');

    let soQuery = {
      status: 'Confirmed',
      is_active: true,
      'items.committed_date': { $lte: horizonDate },
    };

    // Incremental: only SOs updated since last run
    if (run.run_type === 'Incremental' && run.last_run_reference) {
      soQuery.updatedAt = { $gt: run.last_run_reference };
    }

    // Item-Specific: use explicitly provided so_ids
    if (run.run_type === 'Item-Specific' && run.so_ids_considered.length > 0) {
      soQuery._id = { $in: run.so_ids_considered };
      delete soQuery['items.committed_date'];
    }

    const salesOrders = await SalesOrder.find(soQuery).lean();
    run.so_ids_considered = salesOrders.map(s => s._id);
    log(`Found ${salesOrders.length} confirmed SOs`);

    if (salesOrders.length === 0) {
      log('No confirmed SOs found — MRP complete with no actions');
      run.status = 'Completed';
      run.completed_at = new Date();
      run.log = logLines.join('\n');
      await run.save();
      return;
    }

    // ── Step 2: collect gross requirements (BOM explosion per SO line) ───────
    const requirementMap = new Map();

    for (const so of salesOrders) {
      for (const line of so.items) {
        if (line.is_cancelled) continue;
        if (!['Pending', 'In Production'].includes(line.item_status)) continue;

        const pendingQty = Math.max(0, (line.ordered_qty || 0) - (line.delivered_qty || 0));
        if (pendingQty <= 0) continue;

        // Explode BOM for this item
        let components;
        try {
          components = await explodeBOMForItem(line, pendingQty, log);
        } catch (err) {
          log(`WARN: BOM explosion failed for ${line.part_no} — ${err.message}`);
          continue;
        }

        const reqDate = line.committed_date || horizonDate;
        const dateKey = reqDate.toISOString().substring(0, 10);

        // Add the FG item itself to requirements
        const fgKey = `${line.part_no}__${dateKey}`;
        mergeRequirement(requirementMap, fgKey, {
          item_id: line.item_id || null,
          part_no: line.part_no,
          requirement_date: reqDate,
          gross_qty: pendingQty,
          so_number: so.so_number,
          source: 'Manufacture',
        });

        // Add BOM components
        for (const comp of components) {
          const compDate = new Date(reqDate);
          const compKey = `${comp.component_part_no}__${dateKey}`;
          mergeRequirement(requirementMap, compKey, {
            item_id: comp.component_item_id,
            part_no: comp.component_part_no,
            requirement_date: compDate,
            gross_qty: comp.required_qty,
            so_number: so.so_number,
            source: null,
          });
        }
      }
    }

    log(`Gross requirements computed: ${requirementMap.size} item-date combinations`);

    // ── Step 3: Net each requirement ─────────────────────────────────────────
    const Item = getModel('Item');
    if (!Item) throw new Error('Item model not found');

    const mrpLines = [];
    const prToCreate = [];
    const woToCreate = [];

    for (const [key, req] of requirementMap) {
      // Fetch item master
      let itemDoc = null;
      if (req.item_id) {
        itemDoc = await Item.findById(req.item_id).lean();
      }
      if (!itemDoc) {
        itemDoc = await Item.findOne({ part_no: req.part_no }).lean();
      }

      if (!itemDoc) {
        log(`WARN: Item not found for part_no ${req.part_no} — skipping`);
        continue;
      }

      const source = req.source || itemDoc.source || 'Purchase';
      const leadTimeDays = itemDoc.lead_time_days || 0;
      const reorderQty = itemDoc.reorder_qty || 1;

      // Fetch opening stock
      const openingStock = await getOpeningStock(itemDoc._id);

      // Fetch scheduled receipts (open POs + open WOs)
      const scheduledReceipt = await getScheduledReceipts(itemDoc._id, req.requirement_date);

      // Net requirement
      const netReq = Math.max(0, req.gross_qty - openingStock - scheduledReceipt);

      // Planned order qty rounded up to reorder_qty
      const plannedOrderQty = netReq > 0
        ? Math.ceil(netReq / reorderQty) * reorderQty
        : 0;

      // Release date
      let releaseDate = new Date(req.requirement_date);
      releaseDate.setDate(releaseDate.getDate() - leadTimeDays);
      const today = new Date();
      const releaseDateAlert = releaseDate < today
        ? 'ALERT: planned_order_release_date is in the past'
        : '';

      const action = netReq <= 0 ? 'No Action'
        : source === 'Purchase' ? 'Create PO'
        : source === 'Manufacture' ? 'Create WO'
        : 'No Action';

      const line = {
        item_id: itemDoc._id,
        part_no: itemDoc.part_no,
        requirement_date: req.requirement_date,
        gross_requirement: req.gross_qty,
        scheduled_receipt: scheduledReceipt,
        opening_stock: openingStock,
        net_requirement: netReq,
        planned_order_qty: plannedOrderQty,
        planned_order_release_date: releaseDate,
        action,
        source,
        so_references: req.so_numbers || [],
      };

      mrpLines.push(line);
      if (releaseDateAlert) log(`${releaseDateAlert} for ${itemDoc.part_no}`);

      if (action === 'Create PO' && plannedOrderQty > 0) prToCreate.push({ line, itemDoc });
      if (action === 'Create WO' && plannedOrderQty > 0) woToCreate.push({ line, itemDoc });
    }

    run.mrp_lines = mrpLines;
    log(`MRP lines computed: ${mrpLines.length} | PRs: ${prToCreate.length} | WOs: ${woToCreate.length}`);

    // ── Step 4: Auto-create PRs ───────────────────────────────────────────────
    const generatedPrIds = [];
    for (const { line, itemDoc } of prToCreate) {
      try {
        const prId = await autoCreatePR(line, itemDoc, run._id, run.triggered_by);
        const mrpLine = run.mrp_lines.find(
          l => l.part_no === line.part_no &&
            l.requirement_date.toISOString() === line.requirement_date.toISOString()
        );
        if (mrpLine) mrpLine.pr_id = prId;
        generatedPrIds.push(prId);
        log(`PR auto-created for ${itemDoc.part_no} qty ${line.planned_order_qty}`);
      } catch (err) {
        log(`WARN: PR creation failed for ${itemDoc.part_no} — ${err.message}`);
      }
    }
    run.pr_generated = generatedPrIds;

    // ── Step 5: Auto-create WOs ───────────────────────────────────────────────
    const generatedWoIds = [];
    for (const { line, itemDoc } of woToCreate) {
      try {
        const woId = await autoCreateWO(line, itemDoc, run._id, run.triggered_by);
        const mrpLine = run.mrp_lines.find(
          l => l.part_no === line.part_no &&
            l.requirement_date.toISOString() === line.requirement_date.toISOString()
        );
        if (mrpLine) mrpLine.wo_id = woId;
        generatedWoIds.push(woId);
        log(`WO auto-created for ${itemDoc.part_no} qty ${line.planned_order_qty}`);
      } catch (err) {
        log(`WARN: WO creation failed for ${itemDoc.part_no} — ${err.message}`);
      }
    }
    run.wo_generated = generatedWoIds;

    // ── Finalize ─────────────────────────────────────────────────────────────
    run.status = 'Completed';
    run.completed_at = new Date();
    run.log = logLines.join('\n');
    await run.save();

    log('MRP Run completed successfully');
  } catch (err) {
    run.status = 'Failed';
    run.log = logLines.join('\n') + `\nFATAL: ${err.message}`;
    await run.save();
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function mergeRequirement(map, key, { item_id, part_no, requirement_date, gross_qty, so_number, source }) {
  if (map.has(key)) {
    const existing = map.get(key);
    existing.gross_qty += gross_qty;
    if (so_number && !existing.so_numbers.includes(so_number)) existing.so_numbers.push(so_number);
  } else {
    map.set(key, { item_id, part_no, requirement_date, gross_qty, so_numbers: so_number ? [so_number] : [], source });
  }
}

async function explodeBOMForItem(soLine, qty, log) {
  // ✅ FIXED: Use 'Bom' instead of 'BOM'
  const BOM = getModel('Bom');
  if (!BOM) {
    log(`ERROR: Bom model not found`);
    return [];
  }

  // Find default BOM for this item
  const bom = await BOM.findOne({
    parent_item_id: soLine.item_id,
    is_default: true,
    status: { $in: ['Active', 'Approved'] },  // ✅ Include both statuses
  }).lean();

  if (!bom) {
    if (soLine.item_id) log(`WARN: No default active BOM for item_id ${soLine.item_id} (${soLine.part_no})`);
    return [];
  }

  // Recursive explosion
  const results = [];
  await explodeRecursive(bom, qty, 1, results, new Set(), log);
  return results;
}

async function explodeRecursive(bom, multiplier, level, results, visited, log) {
  if (!bom || !bom.components || bom.components.length === 0) return;
  
  // ✅ FIXED: Use 'Bom' instead of 'BOM'
  const BOM = getModel('Bom');
  if (!BOM) return;

  for (const comp of bom.components) {
    if (comp.is_phantom) {
      // Phantom: pass through without adding to results, explode its children
      const childBom = await BOM.findOne({
        parent_item_id: comp.component_item_id,
        is_default: true,
        status: { $in: ['Active', 'Approved'] },  // ✅ Include both statuses
      }).lean();
      if (childBom && !visited.has(String(childBom._id))) {
        visited.add(String(childBom._id));
        const childQty = comp.quantity_per * multiplier * (1 + (comp.scrap_percent || 0) / 100);
        await explodeRecursive(childBom, childQty, level, results, visited, log);
      }
      continue;
    }

    const requiredQty = comp.quantity_per * multiplier * (1 + (comp.scrap_percent || 0) / 100);
    results.push({
      component_item_id: comp.component_item_id,
      component_part_no: comp.component_part_no,
      required_qty: +requiredQty.toFixed(4),
      unit: comp.unit,
      level,
    });

    // Check if this component itself has a BOM (sub-assembly)
    if (!visited.has(String(comp.component_item_id))) {
      const subBom = await BOM.findOne({
        parent_item_id: comp.component_item_id,
        is_default: true,
        status: { $in: ['Active', 'Approved'] },  // ✅ Include both statuses
      }).lean();
      if (subBom) {
        visited.add(String(comp.component_item_id));
        await explodeRecursive(subBom, requiredQty, level + 1, results, visited, log);
      }
    }
  }
}

async function getOpeningStock(itemId) {
  try {
    const StockLedger = getModel('StockLedger');
    if (!StockLedger) return 0;
    const ledger = await StockLedger.findOne({ item_id: itemId }).lean();
    return (ledger && ledger.available_qty) ? ledger.available_qty : 0;
  } catch {
    return 0;
  }
}

async function getScheduledReceipts(itemId, beforeDate) {
  let total = 0;

  // Open POs not yet received
  try {
    const PurchaseOrder = getModel('PurchaseOrder');
    if (PurchaseOrder) {
      const openPOs = await PurchaseOrder.find({
        'items.item_id': itemId,
        status: { $in: ['Approved', 'Sent to Vendor', 'Partially Received'] },
      }).lean();

      for (const po of openPOs) {
        for (const line of (po.items || [])) {
          if (String(line.item_id) === String(itemId)) {
            const pending = (line.ordered_qty || 0) - (line.received_qty || 0);
            total += Math.max(0, pending);
          }
        }
      }
    }
  } catch { /* PO model might not exist yet */ }

  // Open WOs not yet completed
  try {
    const openWOs = await WorkOrder.find({
      item_id: itemId,
      status: { $in: ['Planned', 'Released', 'In Progress', 'Partially Completed'] },
    }).lean();

    for (const wo of openWOs) {
      total += Math.max(0, (wo.planned_qty || 0) - (wo.completed_qty || 0));
    }
  } catch { /* WO model not available */ }

  return total;
}

async function autoCreatePR(line, itemDoc, mrpRunId, triggeredBy) {
  const PurchaseRequisition = getModel('PurchaseRequisition');
  if (!PurchaseRequisition) {
    throw new Error('PurchaseRequisition model not found');
  }

  const pr = new PurchaseRequisition({
    requisition_date: new Date(),
    required_by_date: line.requirement_date,
    requested_by: triggeredBy,
    status: 'Pending Approval',
    source: 'MRP',
    mrp_run_id: mrpRunId,
    items: [{
      item_id: itemDoc._id,
      part_no: itemDoc.part_no,
      description: itemDoc.part_description || itemDoc.part_name || '',
      qty_required: line.planned_order_qty,
      unit: itemDoc.unit || 'Nos',
      required_by: line.requirement_date,
      remarks: `Auto-created by MRP Run — SO refs: ${(line.so_references || []).join(', ')}`,
    }],
    internal_remarks: `Auto-created by MRP Run. Net Req: ${line.net_requirement}`,
  });
  
  const saved = await pr.save();
  return saved._id;
}

async function autoCreateWO(line, itemDoc, mrpRunId, triggeredBy) {
  // ✅ FIXED: Use 'Bom' instead of 'BOM'
  const BOM = getModel('Bom');
  const Routing = getModel('Routing');

  if (!BOM) throw new Error('Bom model not found');

  // Find default BOM
  const bom = await BOM.findOne({
    parent_item_id: itemDoc._id,
    is_default: true,
    status: { $in: ['Active', 'Approved'] },  // ✅ Include both statuses
  }).lean();

  if (!bom) throw new Error(`No active default BOM for ${itemDoc.part_no}`);

  // Find routing (optional)
  let routing = null;
  if (Routing) {
    routing = await Routing.findOne({
      item_id: itemDoc._id,
      is_default: true,
      status: { $in: ['Active', 'Approved'] },
    }).lean();
  }

  // Build operations from routing
  const operations = routing && routing.operations
    ? routing.operations.map(op => ({
        op_sequence: op.op_sequence,
        operation_name: op.operation_name,
        work_centre: op.work_centre || '',
        machine_id: op.machine_id || null,
        is_subcontract: op.is_subcontract || false,
        planned_qty: line.planned_order_qty,
        planned_setup_min: op.setup_time_min || 0,
        planned_run_min: op.cycle_time_min || 0,
        required_skill: op.required_skill || '',
        status: 'Pending',
      }))
    : [];

  const plannedStart = line.planned_order_release_date < new Date()
    ? new Date()
    : line.planned_order_release_date;

  const cycleMins = (bom.cycle_time_min || 0) * line.planned_order_qty;
  const plannedEnd = new Date(plannedStart);
  plannedEnd.setMinutes(plannedEnd.getMinutes() + (cycleMins || 1440));

  const wo = new WorkOrder({
    so_id: null,
    mrp_generated: true,
    so_item_id: new mongoose.Types.ObjectId(),
    so_number: (line.so_references || []).join(', '),
    item_id: itemDoc._id,
    part_no: itemDoc.part_no,
    part_name: itemDoc.part_description || itemDoc.part_name || '',
    drawing_no: itemDoc.drawing_no || '',
    drawing_revision: itemDoc.revision_no || '0',
    bom_id: bom._id,
    bom_version: bom.bom_version || '',
    routing_id: routing ? routing._id : null,
    planned_qty: line.planned_order_qty,
    planned_start: plannedStart,
    planned_end: plannedEnd,
    status: 'Planned',
    mrp_run_id: mrpRunId,
    created_by: triggeredBy,
    operations,
  });

  const saved = await wo.save();
  return saved._id;
}

module.exports = { runMrpJob };