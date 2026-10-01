'use strict';
// routes/Masters/toolMasterRoutes.js

const express = require('express');
const router  = express.Router();
const {
  createTool,
  listTools,
  getToolById,
  updateTool,
  deleteTool,
  logMaintenance,
  getToolAlerts,
} = require('../../controllers/Masters/toolMasterController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: ToolMaster
 *   description: Tool Master — create tools, track shot life, log maintenance
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ToolMasterResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "665abc123def456789012345"
 *         tool_code:
 *           type: string
 *           example: "TOOL-0001"
 *         tool_name:
 *           type: string
 *           example: "Progressive Die 40x5"
 *         tool_type:
 *           type: string
 *           enum:
 *             - Progressive Die
 *             - Blanking Die
 *             - Forming Die
 *             - Piercing Punch
 *             - Bending Tool
 *             - Drawing Die
 *             - Trimming Die
 *             - Compound Die
 *             - Fixture
 *             - Jig
 *             - Gauge
 *             - Other
 *           example: "Progressive Die"
 *         description:
 *           type: string
 *         max_shots:
 *           type: number
 *           example: 500000
 *         current_shots:
 *           type: number
 *           example: 45000
 *         shots_at_last_maintenance:
 *           type: number
 *           example: 0
 *         maintenance_interval_shots:
 *           type: number
 *           example: 50000
 *         alert_threshold_percent:
 *           type: number
 *           example: 90
 *         maintenance_alert:
 *           type: boolean
 *           example: false
 *         replacement_alert:
 *           type: boolean
 *           example: false
 *         tool_material:
 *           type: string
 *           example: "D2"
 *         tool_size:
 *           type: string
 *           example: "300x200mm"
 *         tool_weight_kg:
 *           type: number
 *           example: 12.5
 *         drawing_no:
 *           type: string
 *         drawing_revision:
 *           type: string
 *           example: "A"
 *         tool_cost:
 *           type: number
 *           example: 85000
 *         cost_per_shot:
 *           type: number
 *           example: 0.17
 *         refurbishment_cost:
 *           type: number
 *           example: 2500
 *         manufactured_by:
 *           type: string
 *           enum: [In-House, External Vendor]
 *           example: "In-House"
 *         vendor_id:
 *           type: string
 *           nullable: true
 *         vendor_name:
 *           type: string
 *         warehouse_id:
 *           type: string
 *           nullable: true
 *         bin_location:
 *           type: string
 *           example: "RACK-A-03"
 *         compatible_machines:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of Machine ObjectIds
 *         produces_item_id:
 *           type: string
 *           nullable: true
 *         produces_part_no:
 *           type: string
 *           example: "BUSBAR-CU-40X5"
 *         status:
 *           type: string
 *           enum: [Active, Under Maintenance, Scrapped, In Use, Retired]
 *           example: "Active"
 *         purchase_date:
 *           type: string
 *           format: date
 *           nullable: true
 *         last_used:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         last_maintenance_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         next_maintenance_due_shots:
 *           type: number
 *           example: 50000
 *         life_used_percent:
 *           type: number
 *           description: Virtual — current_shots / max_shots × 100
 *           example: 9.0
 *         shots_remaining:
 *           type: number
 *           description: Virtual — max_shots − current_shots
 *           example: 455000
 *         maintenance_due:
 *           type: boolean
 *           description: Virtual — true if shots since last maintenance >= interval
 *         maintenance_log:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MaintenanceLogEntry'
 *
 *     MaintenanceLogEntry:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *         type:
 *           type: string
 *           enum: [Sharpening, Repair, Inspection, Replacement, Regrind]
 *         shots_before:
 *           type: number
 *           example: 50000
 *         shots_reset_to:
 *           type: number
 *           example: 0
 *         cost:
 *           type: number
 *           example: 2500
 *         performed_by:
 *           type: string
 *           example: "Toolroom team"
 *         remarks:
 *           type: string
 *
 *     CreateToolRequest:
 *       type: object
 *       required:
 *         - tool_name
 *         - tool_type
 *         - max_shots
 *       properties:
 *         tool_code:
 *           type: string
 *           description: Auto-generated as TOOL-XXXX if not provided
 *           example: "TOOL-0001"
 *         tool_name:
 *           type: string
 *           example: "Progressive Die 40x5"
 *         tool_type:
 *           type: string
 *           enum:
 *             - Progressive Die
 *             - Blanking Die
 *             - Forming Die
 *             - Piercing Punch
 *             - Bending Tool
 *             - Drawing Die
 *             - Trimming Die
 *             - Compound Die
 *             - Fixture
 *             - Jig
 *             - Gauge
 *             - Other
 *         description:
 *           type: string
 *         max_shots:
 *           type: number
 *           minimum: 1
 *           example: 500000
 *         maintenance_interval_shots:
 *           type: number
 *           example: 50000
 *           description: Sharpen/inspect every N shots
 *         alert_threshold_percent:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 90
 *           description: Alert fires when life_used_percent exceeds this
 *         tool_material:
 *           type: string
 *           example: "D2"
 *         tool_size:
 *           type: string
 *           example: "300x200mm"
 *         tool_weight_kg:
 *           type: number
 *         drawing_no:
 *           type: string
 *         drawing_revision:
 *           type: string
 *           default: "0"
 *         tool_cost:
 *           type: number
 *           example: 85000
 *         refurbishment_cost:
 *           type: number
 *           example: 2500
 *         manufactured_by:
 *           type: string
 *           enum: [In-House, External Vendor]
 *           default: "In-House"
 *         vendor_id:
 *           type: string
 *           description: Required if manufactured_by = External Vendor
 *         vendor_name:
 *           type: string
 *         warehouse_id:
 *           type: string
 *         bin_location:
 *           type: string
 *           example: "RACK-A-03"
 *         compatible_machines:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of Machine ObjectIds this tool can run on
 *         produces_item_id:
 *           type: string
 *           description: Item Master ObjectId of the part this tool produces
 *         produces_part_no:
 *           type: string
 *           example: "BUSBAR-CU-40X5"
 *         purchase_date:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [Active, Under Maintenance, Scrapped, In Use, Retired]
 *           default: "Active"
 */

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK 1 — Static routes (must be before /:id)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/tool-master/alerts:
 *   get:
 *     summary: All tools with active maintenance or replacement alerts
 *     description: |
 *       Returns every tool where maintenance_alert = true OR replacement_alert = true.
 *       Use this on the toolroom dashboard to drive daily maintenance decisions.
 *       maintenance_alert fires when life_used_percent >= alert_threshold_percent (default 90%).
 *       replacement_alert fires when current_shots >= max_shots.
 *     tags: [ToolMaster]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alert list returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       tool_code:
 *                         type: string
 *                       tool_name:
 *                         type: string
 *                       tool_type:
 *                         type: string
 *                       current_shots:
 *                         type: number
 *                       max_shots:
 *                         type: number
 *                       life_used_percent:
 *                         type: number
 *                       shots_remaining:
 *                         type: number
 *                       maintenance_alert:
 *                         type: boolean
 *                       replacement_alert:
 *                         type: boolean
 *                       status:
 *                         type: string
 *                       compatible_machines:
 *                         type: array
 *                         items:
 *                           type: object
 *                       last_used:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/alerts', getToolAlerts);

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK 2 — Collection routes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/tool-master:
 *   get:
 *     summary: List all tools with filters and pagination
 *     tags: [ToolMaster]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Under Maintenance, Scrapped, In Use, Retired]
 *         description: Filter by tool status
 *       - in: query
 *         name: tool_type
 *         schema:
 *           type: string
 *           enum:
 *             - Progressive Die
 *             - Blanking Die
 *             - Forming Die
 *             - Piercing Punch
 *             - Bending Tool
 *             - Drawing Die
 *             - Trimming Die
 *             - Compound Die
 *             - Fixture
 *             - Jig
 *             - Gauge
 *             - Other
 *       - in: query
 *         name: machine_id
 *         schema:
 *           type: string
 *         description: Filter tools compatible with a specific machine
 *       - in: query
 *         name: part_no
 *         schema:
 *           type: string
 *         description: Filter by produces_part_no (partial match)
 *       - in: query
 *         name: near_maintenance
 *         schema:
 *           type: boolean
 *         description: If true, returns only tools with maintenance_alert = true
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Partial match on tool_name
 *     responses:
 *       200:
 *         description: Tool list returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ToolMasterResponse'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/', listTools);

/**
 * @swagger
 * /api/tool-master:
 *   post:
 *     summary: Create a new tool
 *     description: |
 *       Creates a Tool Master record.
 *       tool_code is auto-generated as TOOL-XXXX if not provided.
 *       cost_per_shot is auto-computed as tool_cost / max_shots on save.
 *       The _id returned is used as tool_id in POST /api/tool-usage.
 *     tags: [ToolMaster]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateToolRequest'
 *           examples:
 *             progressive_die:
 *               summary: Progressive die for busbar stamping
 *               value:
 *                 tool_name: "Progressive Die 40x5"
 *                 tool_type: "Progressive Die"
 *                 max_shots: 500000
 *                 maintenance_interval_shots: 50000
 *                 alert_threshold_percent: 90
 *                 tool_material: "D2"
 *                 tool_size: "300x200mm"
 *                 tool_cost: 85000
 *                 refurbishment_cost: 2500
 *                 manufactured_by: "In-House"
 *                 bin_location: "RACK-A-03"
 *                 produces_part_no: "BUSBAR-CU-40X5"
 *             blanking_die:
 *               summary: Blanking die for gasket
 *               value:
 *                 tool_name: "Blanking Die 150x80"
 *                 tool_type: "Blanking Die"
 *                 max_shots: 200000
 *                 maintenance_interval_shots: 25000
 *                 tool_material: "H13"
 *                 tool_cost: 45000
 *                 manufactured_by: "External Vendor"
 *                 vendor_name: "Precision Tools Pvt Ltd"
 *     responses:
 *       201:
 *         description: Tool created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Tool created"
 *                 data:
 *                   $ref: '#/components/schemas/ToolMasterResponse'
 *       400:
 *         description: Validation error or duplicate tool_code
 *       401:
 *         description: Unauthorized
 */
router.post('/', authorize('admin', 'manager', 'production'), createTool);

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK 3 — Document routes /:id and /:id/sub-resource
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/tool-master/{id}:
 *   get:
 *     summary: Get a single tool by ID
 *     description: |
 *       Returns full tool detail including maintenance_log history and all virtual fields.
 *       Use the _id from this response as tool_id when calling POST /api/tool-usage.
 *     tags: [ToolMaster]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/toolId'
 *     responses:
 *       200:
 *         description: Tool detail returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ToolMasterResponse'
 *       400:
 *         description: Invalid tool ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tool not found
 */
router.get('/:id', getToolById);

/**
 * @swagger
 * /api/tool-master/{id}:
 *   put:
 *     summary: Update tool details
 *     description: |
 *       Updates tool master fields.
 *       Do NOT use this to update current_shots — shots are updated automatically
 *       via POST /api/tool-usage when shots_fired is recorded.
 *       Updatable fields: tool_name, tool_type, description, max_shots,
 *       maintenance_interval_shots, alert_threshold_percent, tool_material,
 *       tool_size, tool_weight_kg, drawing_no, drawing_revision,
 *       tool_cost, refurbishment_cost, manufactured_by, vendor_id, vendor_name,
 *       warehouse_id, bin_location, compatible_machines,
 *       produces_item_id, produces_part_no, status.
 *     tags: [ToolMaster]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/toolId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Any subset of CreateToolRequest fields. At least one required.
 *             properties:
 *               tool_name:
 *                 type: string
 *               tool_type:
 *                 type: string
 *               max_shots:
 *                 type: number
 *               maintenance_interval_shots:
 *                 type: number
 *               alert_threshold_percent:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [Active, Under Maintenance, Scrapped, In Use, Retired]
 *               bin_location:
 *                 type: string
 *               compatible_machines:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Tool updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ToolMasterResponse'
 *       400:
 *         description: Invalid ID or validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tool not found
 */
router.put('/:id', authorize('admin', 'manager', 'production'), updateTool);

/**
 * @swagger
 * /api/tool-master/{id}:
 *   delete:
 *     summary: Soft-retire a tool (sets is_active = false, status = Retired)
 *     description: |
 *       Does NOT hard-delete the record — tool history is preserved.
 *       Retired tools no longer appear in list results or tool-usage dropdowns.
 *       Cannot be undone via API — reactivate manually in DB if needed.
 *     tags: [ToolMaster]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/toolId'
 *     responses:
 *       200:
 *         description: Tool retired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Tool TOOL-0001 retired"
 *       400:
 *         description: Invalid tool ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tool not found
 */
router.delete('/:id', authorize('admin', 'manager'), deleteTool);

/**
 * @swagger
 * /api/tool-master/{id}/maintenance:
 *   post:
 *     summary: Log a maintenance event and reset shot counter
 *     description: |
 *       Records a maintenance entry in maintenance_log[].
 *       Resets shots_at_last_maintenance to current_shots (or to reset_shots_to if provided).
 *       Clears maintenance_alert and replacement_alert.
 *       Sets status back to Active.
 *       Recomputes next_maintenance_due_shots = current_shots + maintenance_interval_shots.
 *
 *       **Typical use cases:**
 *       - After sharpening/regrinding: reset_shots_to = 0 (full reset)
 *       - After inspection only: omit reset_shots_to (counter stays, just logs the inspection)
 *       - After replacement: reset_shots_to = 0
 *     tags: [ToolMaster]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/toolId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [Sharpening, Repair, Inspection, Replacement, Regrind]
 *                 example: "Sharpening"
 *               reset_shots_to:
 *                 type: number
 *                 example: 0
 *                 description: |
 *                   New value for current_shots after maintenance.
 *                   Omit to keep current_shots unchanged (inspection-only).
 *               cost:
 *                 type: number
 *                 example: 2500
 *               performed_by:
 *                 type: string
 *                 example: "Toolroom team"
 *               remarks:
 *                 type: string
 *                 example: "Regrind — 0.2mm removed"
 *           examples:
 *             sharpening:
 *               summary: Full sharpening — reset counter to 0
 *               value:
 *                 type: "Sharpening"
 *                 reset_shots_to: 0
 *                 cost: 2500
 *                 performed_by: "Toolroom team"
 *                 remarks: "Regrind — 0.2mm removed from punch face"
 *             inspection_only:
 *               summary: Inspection only — do not reset counter
 *               value:
 *                 type: "Inspection"
 *                 cost: 0
 *                 performed_by: "QC dept"
 *                 remarks: "Visual check — no regrind needed"
 *     responses:
 *       200:
 *         description: Maintenance logged and counters updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Maintenance logged for TOOL-0001. Shots reset from 50000 to 0."
 *                 data:
 *                   type: object
 *                   properties:
 *                     tool_code:
 *                       type: string
 *                       example: "TOOL-0001"
 *                     shots_before:
 *                       type: number
 *                       example: 50000
 *                     shots_after:
 *                       type: number
 *                       example: 0
 *                     next_maintenance_at:
 *                       type: number
 *                       example: 50000
 *                     life_used_percent:
 *                       type: number
 *                       example: 0.0
 *       400:
 *         description: Missing maintenance type or invalid ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tool not found
 */
router.post('/:id/maintenance', authorize('admin', 'manager', 'production'), logMaintenance);

/**
 * @swagger
 * components:
 *   parameters:
 *     toolId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *         pattern: "^[a-f0-9]{24}$"
 *       description: MongoDB _id of the Tool Master record
 *       example: "665abc123def456789012345"
 */

module.exports = router;