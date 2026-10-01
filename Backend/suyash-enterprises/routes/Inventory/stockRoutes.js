// routes/Inventory/stockLedgerRoutes.js
const express = require('express');
const router = express.Router();
const {
  // Main CRUD operations
  getStockLedger,
  getStockByItemId,
  getInventoryValuation,
  
  // Stock analysis
  getStockAging,
  getBatchExpiry,
  getStockByWarehouse,
  
  // Transaction history
  getStockTransactions,
  getBatchTraceability,
  
  // FIFO operations
  selectFIFOBatches
  
} = require('../../controllers/Inventory/stockLedgerController');

const { protect } = require('../../middleware/authMiddleware');

router.use(protect);

/**
 * @swagger
 * tags:
 *   - name: Stock Ledger
 *     description: Real-time inventory stock management - current balances
 *   - name: Stock Transactions
 *     description: Immutable audit trail of all stock movements
 *   - name: Inventory Reports
 *     description: Analytical reports for inventory management
 */

// ======================================================
// STOCK LEDGER APIs
// ======================================================

/**
 * @swagger
 * /api/stock-ledger:
 *   get:
 *     summary: Get real-time stock balances
 *     description: |
 *       Returns current stock levels for all items across warehouses, bins, and batches.
 *       Shows live quantity, reserved quantity, available quantity, and valuation.
 *       
 *       **Use Case:** Store manager checking current stock before issuing material.
 *     tags: [Stock Ledger]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: item_id
 *         schema:
 *           type: string
 *         description: Filter by specific item ID
 *         example: "69d494a3a8ae6ad4391cb153"
 *       - in: query
 *         name: part_no
 *         schema:
 *           type: string
 *         description: Search by part number (partial match, case insensitive)
 *         example: "BR-011"
 *       - in: query
 *         name: warehouse_id
 *         schema:
 *           type: string
 *         description: Filter by warehouse ID
 *         example: "69d63c4520df5e7e529131f6"
 *       - in: query
 *         name: bin_id
 *         schema:
 *           type: string
 *         description: Filter by bin location
 *         example: "RACK-A-01"
 *       - in: query
 *         name: batch_no
 *         schema:
 *           type: string
 *         description: Filter by batch number
 *         example: "BATCH-2401"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [createdAt, last_updated, quantity, total_value, part_no]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: Stock ledger retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       stock_id:
 *                         type: string
 *                         example: "STK-001"
 *                       part_no:
 *                         type: string
 *                         example: "BR-011"
 *                       quantity:
 *                         type: number
 *                         example: 500
 *                         description: Current physical stock
 *                       reserved_qty:
 *                         type: number
 *                         example: 100
 *                         description: Quantity reserved for work orders
 *                       available_qty:
 *                         type: number
 *                         example: 400
 *                         description: Quantity available for issue (quantity - reserved_qty)
 *                       unit_cost:
 *                         type: number
 *                         example: 450
 *                         description: Current cost per unit
 *                       total_value:
 *                         type: number
 *                         example: 225000
 *                         description: Total value (quantity × unit_cost)
 *                       warehouse_id:
 *                         type: object
 *                         properties:
 *                           warehouse_id:
 *                             type: string
 *                             example: "WH-RM01"
 *                           warehouse_name:
 *                             type: string
 *                             example: "Raw Material Store"
 *                       bin_id:
 *                         type: string
 *                         example: "RACK-A-01"
 *                       batch_no:
 *                         type: string
 *                         example: "BATCH-2401"
 *                       receipt_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-04-01T10:00:00Z"
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total_quantity:
 *                       type: number
 *                       example: 1500
 *                     total_reserved:
 *                       type: number
 *                       example: 200
 *                     total_value:
 *                       type: number
 *                       example: 675000
 *                     unique_items_count:
 *                       type: number
 *                       example: 5
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 45
 *                     pages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Not authenticated - valid token required
 *       500:
 *         description: Server error
 */
router.get('/stock-ledger', getStockLedger);

/**
 * @swagger
 * /api/stock-ledger/item/{item_id}:
 *   get:
 *     summary: Get stock for a single item across all locations
 *     description: |
 *       Returns complete stock position for a specific item including:
 *       - All warehouses where the item is stored
 *       - All bins within each warehouse
 *       - All batches with their quantities and costs
 *       
 *       **Use Case:** Production planner checking if enough material is available before releasing work order.
 *     tags: [Stock Ledger]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: item_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID to fetch stock for
 *         example: "69d494a3a8ae6ad4391cb153"
 *     responses:
 *       200:
 *         description: Item stock retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       warehouse_id:
 *                         type: object
 *                         properties:
 *                           warehouse_id:
 *                             type: string
 *                             example: "WH-RM01"
 *                           warehouse_name:
 *                             type: string
 *                             example: "Raw Material Store"
 *                       bin_id:
 *                         type: string
 *                         example: "RACK-A-01"
 *                       batch_no:
 *                         type: string
 *                         example: "BATCH-2401"
 *                       quantity:
 *                         type: number
 *                         example: 300
 *                       reserved_qty:
 *                         type: number
 *                         example: 0
 *                       available_qty:
 *                         type: number
 *                         example: 300
 *                       unit_cost:
 *                         type: number
 *                         example: 450
 *                       total_value:
 *                         type: number
 *                         example: 135000
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total_quantity:
 *                       type: number
 *                       example: 500
 *                     total_reserved:
 *                       type: number
 *                       example: 100
 *                     total_available:
 *                       type: number
 *                       example: 400
 *                     total_value:
 *                       type: number
 *                       example: 225000
 *       404:
 *         description: Item not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/stock-ledger/item/:item_id', getStockByItemId);

/**
 * @swagger
 * /api/stock-ledger/valuation:
 *   get:
 *     summary: Get inventory valuation report for Balance Sheet
 *     description: |
 *       Returns total inventory value grouped by warehouse.
 *       Used by accounts team for financial reporting and Balance Sheet preparation.
 *       
 *       **Use Case:** Monthly closing - accounts needs inventory value for P&L and Balance Sheet.
 *     tags: [Inventory Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: warehouse_id
 *         schema:
 *           type: string
 *         description: Filter by specific warehouse ID
 *         example: "69d63c4520df5e7e529131f6"
 *       - in: query
 *         name: valuation_method
 *         schema:
 *           type: string
 *           enum: [FIFO, Weighted Average]
 *         description: Filter by valuation method
 *         example: "Weighted Average"
 *     responses:
 *       200:
 *         description: Valuation report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       warehouse_id:
 *                         type: string
 *                         example: "69d63c4520df5e7e529131f6"
 *                       warehouse_code:
 *                         type: string
 *                         example: "WH-RM01"
 *                       warehouse_name:
 *                         type: string
 *                         example: "Raw Material Store"
 *                       warehouse_type:
 *                         type: string
 *                         example: "Raw Material"
 *                       total_quantity:
 *                         type: number
 *                         example: 1500
 *                       total_value:
 *                         type: number
 *                         example: 675000
 *                       items_count:
 *                         type: number
 *                         example: 8
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total_quantity:
 *                       type: number
 *                       example: 2500
 *                     total_value:
 *                       type: number
 *                       example: 1125000
 *                     unique_items_count:
 *                       type: number
 *                       example: 15
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/stock-ledger/valuation', getInventoryValuation);

/**
 * @swagger
 * /api/stock-ledger/fifo-select:
 *   post:
 *     summary: Test FIFO batch selection logic
 *     description: |
 *       Simulates FIFO (First-In-First-Out) batch selection for a given quantity.
 *       Returns which batches would be selected and their costs.
 *       
 *       **Use Case:** Before creating MIV, test which batches will be issued first.
 *       Useful for cost estimation and batch tracking.
 *     tags: [Stock Ledger]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - item_id
 *               - warehouse_id
 *               - quantity
 *             properties:
 *               item_id:
 *                 type: string
 *                 description: Item ID to test FIFO for
 *                 example: "69d494a3a8ae6ad4391cb153"
 *               warehouse_id:
 *                 type: string
 *                 description: Warehouse ID where stock is located
 *                 example: "69d63c4520df5e7e529131f6"
 *               quantity:
 *                 type: number
 *                 description: Quantity needed
 *                 example: 150
 *     responses:
 *       200:
 *         description: FIFO selection successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     selected_batches:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           batch_no:
 *                             type: string
 *                             example: "BATCH-001"
 *                           quantity:
 *                             type: number
 *                             example: 100
 *                           unit_cost:
 *                             type: number
 *                             example: 700
 *                           total_value:
 *                             type: number
 *                             example: 70000
 *                           receipt_date:
 *                             type: string
 *                             format: date-time
 *                     total_quantity:
 *                       type: number
 *                       example: 150
 *                     total_value:
 *                       type: number
 *                       example: 110000
 *                     average_cost:
 *                       type: number
 *                       example: 733.33
 *       400:
 *         description: Invalid input or insufficient stock
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/stock-ledger/fifo-select', selectFIFOBatches);

// ======================================================
// STOCK TRANSACTION APIs (Audit Trail)
// ======================================================

/**
 * @swagger
 * /api/stock-transactions:
 *   get:
 *     summary: Get immutable stock transaction history
 *     description: |
 *       Returns complete audit trail of ALL stock movements.
 *       Records are NEVER deleted or modified - only appended.
 *       
 *       **Use Cases:**
 *       - Audit: Trace any stock change back to source document
 *       - Investigation: Find why stock is showing incorrect quantity
 *       - Compliance: Provide transaction history for statutory audit
 *       
 *       **Transaction Types:**
 *       - GRN Receipt (Stock IN)
 *       - Material Issue (Stock OUT to Production)
 *       - Material Return (Stock IN from Production)
 *       - Production Receipt (FG Stock IN)
 *       - Stock Transfer (Move between warehouses)
 *       - Scrap (Stock OUT to Scrap)
 *       - Adjustment (Physical count correction)
 *     tags: [Stock Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: item_id
 *         schema:
 *           type: string
 *         description: Filter by item ID
 *         example: "69d494a3a8ae6ad4391cb153"
 *       - in: query
 *         name: part_no
 *         schema:
 *           type: string
 *         description: Filter by part number
 *         example: "BR-011"
 *       - in: query
 *         name: txn_type
 *         schema:
 *           type: string
 *           enum: [GRN Receipt, Material Issue, Material Return, Production Receipt, Stock Transfer, Scrap, Adjustment, Opening Stock, Physical Count]
 *         description: Filter by transaction type
 *         example: "Material Issue"
 *       - in: query
 *         name: from_warehouse
 *         schema:
 *           type: string
 *         description: Filter by source warehouse ID
 *       - in: query
 *         name: to_warehouse
 *         schema:
 *           type: string
 *         description: Filter by destination warehouse ID
 *       - in: query
 *         name: batch_no
 *         schema:
 *           type: string
 *         description: Filter by batch number
 *         example: "BATCH-2401"
 *       - in: query
 *         name: ref_document_type
 *         schema:
 *           type: string
 *           enum: [GRN, WO, SO, DC, PR, MIV, MRV, PSV]
 *         description: Filter by source document type
 *       - in: query
 *         name: ref_document_id
 *         schema:
 *           type: string
 *         description: Filter by source document number
 *         example: "MIV-202604-001"
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for transaction range
 *         example: "2026-03-01"
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for transaction range
 *         example: "2026-04-13"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 200
 *         description: Items per page
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [txn_date, createdAt, txn_id]
 *           default: txn_date
 *         description: Sort field
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Stock transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       txn_id:
 *                         type: string
 *                         example: "TXN-20260413-0001"
 *                       txn_type:
 *                         type: string
 *                         example: "Material Issue"
 *                       txn_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-04-13T10:30:00Z"
 *                       part_no:
 *                         type: string
 *                         example: "BR-011"
 *                       quantity:
 *                         type: number
 *                         example: 200
 *                       unit:
 *                         type: string
 *                         example: "Nos"
 *                       unit_cost:
 *                         type: number
 *                         example: 450
 *                       total_value:
 *                         type: number
 *                         example: 90000
 *                       batch_no:
 *                         type: string
 *                         example: "BATCH-2401"
 *                       from_warehouse:
 *                         type: object
 *                         properties:
 *                           warehouse_id:
 *                             type: string
 *                           warehouse_name:
 *                             type: string
 *                       to_warehouse:
 *                         type: object
 *                         properties:
 *                           warehouse_id:
 *                             type: string
 *                           warehouse_name:
 *                             type: string
 *                       ref_document_type:
 *                         type: string
 *                         example: "MIV"
 *                       ref_document_id:
 *                         type: string
 *                         example: "MIV-202604-001"
 *                       remarks:
 *                         type: string
 *                       created_by:
 *                         type: object
 *                         properties:
 *                           Username:
 *                             type: string
 *                           Email:
 *                             type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 50
 *                     total:
 *                       type: integer
 *                       example: 1250
 *                     pages:
 *                       type: integer
 *                       example: 25
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/stock-transactions', getStockTransactions);

/**
 * @swagger
 * /api/stock-transactions/batch-trace/{batch_no}:
 *   get:
 *     summary: Get complete batch traceability chain
 *     description: |
 *       Returns full genealogy of a batch from GRN receipt through all movements.
 *       Shows where the batch came from and where it went.
 *       
 *       **Use Cases:**
 *       - Customer requirement: "Which raw material batch went into our finished product?"
 *       - Quality issue: Trace defective material back to vendor
 *       - Recall management: Find all products containing a specific batch
 *       
 *       **Traceability Chain:**
 *       GRN Receipt → Stock Ledger → Material Issue → Work Order → Finished Good
 *     tags: [Stock Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: batch_no
 *         required: true
 *         schema:
 *           type: string
 *         description: Batch/Lot number to trace
 *         example: "BATCH-2401"
 *     responses:
 *       200:
 *         description: Batch traceability retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     batch_no:
 *                       type: string
 *                       example: "BATCH-2401"
 *                     traceability_chain:
 *                       type: object
 *                       properties:
 *                         grn_receipt:
 *                           type: object
 *                           description: Initial receipt details
 *                           properties:
 *                             date:
 *                               type: string
 *                               format: date-time
 *                             quantity:
 *                               type: number
 *                             from:
 *                               type: string
 *                             to:
 *                               type: string
 *                             ref_document:
 *                               type: string
 *                         material_issues:
 *                           type: array
 *                           description: All MIV issues from this batch
 *                         production_receipts:
 *                           type: array
 *                           description: FG receipts using this batch
 *                         returns:
 *                           type: array
 *                           description: Material returns
 *                         scrap:
 *                           type: array
 *                           description: Scrap recorded
 *                         current_location:
 *                           type: object
 *                           description: Current stock location
 *                           properties:
 *                             warehouse:
 *                               type: string
 *                             bin:
 *                               type: string
 *                             date:
 *                               type: string
 *                             status:
 *                               type: string
 *                     all_transactions:
 *                       type: array
 *                       description: Complete chronological transaction list
 *       404:
 *         description: Batch not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/stock-transactions/batch-trace/:batch_no', getBatchTraceability);

// ======================================================
// INVENTORY REPORT APIs
// ======================================================

/**
 * @swagger
 * /api/stock-aging:
 *   get:
 *     summary: Get slow-moving stock items (aging analysis)
 *     description: |
 *       Identifies items that haven't moved for specified number of days.
 *       
 *       **Use Cases:**
 *       - Identify obsolete inventory for write-off
 *       - Plan clearance sales for slow-moving items
 *       - Optimize inventory holding costs
 *       
 *       **Aging Categories:**
 *       - 30-60 days: Starting to age
 *       - 60-90 days: Slow moving
 *       - 90-180 days: Very slow moving
 *       - 180+ days: Obsolete (consider write-off)
 *     tags: [Inventory Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *           minimum: 1
 *         description: Minimum days without movement
 *         example: 60
 *       - in: query
 *         name: warehouse_id
 *         schema:
 *           type: string
 *         description: Filter by warehouse ID
 *         example: "69d63c4520df5e7e529131f6"
 *       - in: query
 *         name: item_category
 *         schema:
 *           type: string
 *         description: Filter by item category
 *         example: "Raw Material"
 *     responses:
 *       200:
 *         description: Stock aging report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     aging_30_60:
 *                       type: array
 *                       description: Items not moved for 30-60 days
 *                     aging_60_90:
 *                       type: array
 *                       description: Items not moved for 60-90 days
 *                     aging_90_180:
 *                       type: array
 *                       description: Items not moved for 90-180 days
 *                     aging_180_plus:
 *                       type: array
 *                       description: Items not moved for 180+ days
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total_slow_moving:
 *                       type: number
 *                       example: 12
 *                     total_value:
 *                       type: number
 *                       example: 250000
 *                     total_aging_value:
 *                       type: number
 *                       example: 250000
 *                     aging_period_days:
 *                       type: integer
 *                       example: 60
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/stock-aging', getStockAging);

/**
 * @swagger
 * /api/stock-ledger/batch-expiry:
 *   get:
 *     summary: Get batches nearing expiry date
 *     description: |
 *       Returns batches that will expire within specified days.
 *       Critical for items with shelf life (rubber, adhesives, chemicals, food).
 *       
 *       **Expiry Status:**
 *       - Critical: ≤ 7 days to expiry (immediate action required)
 *       - Warning: 8-30 days to expiry (plan for usage)
 *       - Normal: >30 days to expiry
 *       
 *       **Use Case:** QC team needs to prioritize usage of expiring batches.
 *     tags: [Inventory Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *           minimum: 1
 *         description: Days threshold for expiry warning
 *         example: 45
 *       - in: query
 *         name: warehouse_id
 *         schema:
 *           type: string
 *         description: Filter by warehouse ID
 *         example: "69d63c4520df5e7e529131f6"
 *       - in: query
 *         name: item_category
 *         schema:
 *           type: string
 *         description: Filter by item category
 *         example: "Consumable"
 *     responses:
 *       200:
 *         description: Batch expiry report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       part_no:
 *                         type: string
 *                         example: "RUBBER-SHEET-001"
 *                       batch_no:
 *                         type: string
 *                         example: "BATCH-2401"
 *                       quantity:
 *                         type: number
 *                         example: 100
 *                       receipt_date:
 *                         type: string
 *                         format: date-time
 *                       expiry_date:
 *                         type: string
 *                         format: date-time
 *                       days_to_expiry:
 *                         type: integer
 *                         example: 15
 *                       expiry_status:
 *                         type: string
 *                         enum: [Critical, Warning, Normal]
 *                         example: "Warning"
 *                       expiry_value:
 *                         type: number
 *                         example: 45000
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total_expiring:
 *                       type: number
 *                       example: 8
 *                     critical_count:
 *                       type: number
 *                       example: 2
 *                     critical_value:
 *                       type: number
 *                       example: 25000
 *                     warning_count:
 *                       type: number
 *                       example: 6
 *                     warning_value:
 *                       type: number
 *                       example: 120000
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/stock-ledger/batch-expiry', getBatchExpiry);

// ======================================================
// SUMMARY / DASHBOARD API
// ======================================================

/**
 * @swagger
 * /api/stock-ledger/summary:
 *   get:
 *     summary: Get quick stock summary for dashboard
 *     description: |
 *       Returns high-level inventory metrics for dashboard display.
 *       Fast, lightweight endpoint for home page.
 *       
 *       **Use Case:** Management dashboard showing real-time inventory health.
 *     tags: [Inventory Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_inventory_value:
 *                       type: number
 *                       description: Total value of all inventory (₹)
 *                       example: 1250000
 *                     total_stock_quantity:
 *                       type: number
 *                       description: Total quantity across all items
 *                       example: 5000
 *                     unique_items_count:
 *                       type: number
 *                       description: Number of unique items in stock
 *                       example: 45
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       description: When this summary was generated
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/stock-ledger/summary', async (req, res) => {
  try {
    const StockLedger = require('../../models/Inventory/StockLedger');
    
    // Get total inventory value
    const inventoryValue = await StockLedger.aggregate([
      { $match: { quantity: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$total_value' } } }
    ]);
    
    // Get total stock quantity
    const totalQuantity = await StockLedger.aggregate([
      { $match: { quantity: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    
    // Get unique items count
    const uniqueItems = await StockLedger.distinct('item_id', { quantity: { $gt: 0 } });
    
    res.status(200).json({
      success: true,
      data: {
        total_inventory_value: inventoryValue[0]?.total || 0,
        total_stock_quantity: totalQuantity[0]?.total || 0,
        unique_items_count: uniqueItems.length,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Get stock summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock summary',
      error: error.message
    });
  }
});


// Add this new route after the getStockByItemId route

/**
 * @swagger
 * /api/stock-ledger/warehouse/{warehouse_id}:
 *   get:
 *     summary: Get stock for a specific warehouse
 *     description: |
 *       Returns complete stock position for a specific warehouse including:
 *       - All items stored in the warehouse
 *       - Bin-wise breakdown of stock
 *       - Current quantities, costs, and values
 *       
 *       **Use Case:** Store manager checking what's available in their warehouse.
 *     tags: [Stock Ledger]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: warehouse_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Warehouse ID to fetch stock for
 *         example: "69d63c4520df5e7e529131f6"
 *       - in: query
 *         name: include_zero_stock
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include items with zero quantity
 *         example: false
 *     responses:
 *       200:
 *         description: Warehouse stock retrieved successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Warehouse not found
 *       500:
 *         description: Server error
 */
router.get('/stock-ledger/warehouse/:warehouse_id', getStockByWarehouse);

module.exports = router;