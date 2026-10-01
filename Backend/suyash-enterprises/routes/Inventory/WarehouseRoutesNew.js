const express = require('express');
const router = express.Router();
const {
  createWarehouse,
  getAllWarehouses,
  getWarehouseById,
  updateWarehouse,
  addBin,
  updateBin,
  deleteBin,
  deleteWarehouse,
  getWarehouseBins,
  getAvailableBins,
  getWarehouseCapacityReport
} = require('../../controllers/Inventory/warehouseController');

const { protect } = require('../../middleware/authMiddleware');

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Warehouse & Bin Master
 *   description: Warehouse and bin management for inventory storage
 */

// ======================================================
// COMMON COMPONENTS
// ======================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     # ========== BIN SCHEMA ==========
 *     Bin:
 *       type: object
 *       properties:
 *         bin_id:
 *           type: string
 *           example: "BIN-001"
 *           description: Unique bin identifier within warehouse
 *         bin_code:
 *           type: string
 *           example: "A-1-1"
 *           description: Short display code printed on bin labels
 *         rack:
 *           type: string
 *           example: "A"
 *           description: Rack identifier
 *         row:
 *           type: integer
 *           example: 1
 *           description: Row number within the rack
 *         col:
 *           type: integer
 *           example: 1
 *           description: Column/bin number within the row
 *         capacity:
 *           type: number
 *           example: 5000
 *           description: Maximum capacity in item's unit of measure
 *         is_active:
 *           type: boolean
 *           example: true
 *         current_stock:
 *           type: object
 *           properties:
 *             quantity:
 *               type: number
 *               example: 1200
 *             value:
 *               type: number
 *               example: 126000
 *             items:
 *               type: number
 *               example: 3
 *         utilization_percentage:
 *           type: string
 *           example: "24.00"
 *
 *     # ========== WAREHOUSE SCHEMA ==========
 *     Warehouse:
 *       type: object
 *       required:
 *         - warehouse_name
 *         - warehouse_type
 *       properties:
 *         _id:
 *           type: string
 *           example: "67e1a3b4c5d6e7f8a9b0c1d2"
 *         warehouse_id:
 *           type: string
 *           example: "WH-RM01"
 *           description: Auto-generated format WH-XXX
 *         warehouse_name:
 *           type: string
 *           example: "Raw Material Store — Ground Floor North"
 *         warehouse_type:
 *           type: string
 *           enum: ['Raw Material', 'WIP', 'Finished Goods', 'Consumable', 'Tool', 'Scrap', 'Subcontract', 'Quarantine']
 *           example: "Raw Material"
 *         location:
 *           type: string
 *           example: "Ground Floor, Bay 1, North Wing"
 *         manager_id:
 *           type: string
 *           example: "67e1a3b4c5d6e7f8a9b0c1d3"
 *         bins:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Bin'
 *         is_active:
 *           type: boolean
 *           default: true
 *         stock_summary:
 *           type: object
 *           properties:
 *             total_quantity:
 *               type: number
 *             total_value:
 *               type: number
 *             unique_items_count:
 *               type: number
 *         created_by:
 *           type: object
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     # ========== CREATE WAREHOUSE SCHEMA ==========
 *     WarehouseCreate:
 *       type: object
 *       required:
 *         - warehouse_name
 *         - warehouse_type
 *       properties:
 *         warehouse_name:
 *           type: string
 *           example: "Raw Material Store — Ground Floor North"
 *         warehouse_type:
 *           type: string
 *           enum: ['Raw Material', 'WIP', 'Finished Goods', 'Consumable', 'Tool', 'Scrap', 'Subcontract', 'Quarantine']
 *           example: "Raw Material"
 *         location:
 *           type: string
 *           example: "Ground Floor, Bay 1, North Wing"
 *         manager_id:
 *           type: string
 *           example: "67e1a3b4c5d6e7f8a9b0c1d3"
 *         bins:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - bin_id
 *               - bin_code
 *             properties:
 *               bin_id:
 *                 type: string
 *                 example: "BIN-001"
 *               bin_code:
 *                 type: string
 *                 example: "A-1-1"
 *               rack:
 *                 type: string
 *                 example: "A"
 *               row:
 *                 type: integer
 *                 example: 1
 *               col:
 *                 type: integer
 *                 example: 1
 *               capacity:
 *                 type: number
 *                 example: 5000
 *         is_active:
 *           type: boolean
 *           default: true
 *
 *     # ========== CREATE BIN SCHEMA ==========
 *     BinCreate:
 *       type: object
 *       required:
 *         - bin_id
 *         - bin_code
 *       properties:
 *         bin_id:
 *           type: string
 *           example: "BIN-004"
 *         bin_code:
 *           type: string
 *           example: "B-2-3"
 *         rack:
 *           type: string
 *           example: "B"
 *         row:
 *           type: integer
 *           example: 2
 *         col:
 *           type: integer
 *           example: 3
 *         capacity:
 *           type: number
 *           example: 3000
 *
 *   responses:
 *     WarehouseNotFound:
 *       description: Warehouse not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Warehouse not found"
 *               error:
 *                 type: string
 *                 example: "WAREHOUSE_NOT_FOUND"
 *
 *   parameters:
 *     warehouseIdParam:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Warehouse ID
 *     binIdParam:
 *       in: path
 *       name: binId
 *       required: true
 *       schema:
 *         type: string
 *       description: Bin ID
 */

// ======================================================
// WAREHOUSE APIs
// ======================================================

/**
 * @swagger
 * /api/warehouses:
 *   post:
 *     summary: Create a new warehouse with bins
 *     tags: [Warehouse & Bin Master]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WarehouseCreate'
 *           examples:
 *             raw_material_warehouse:
 *               summary: Raw Material Warehouse
 *               value:
 *                 warehouse_name: "Raw Material Store - Copper & Aluminum"
 *                 warehouse_type: "Raw Material"
 *                 location: "Building A, Ground Floor, Section 2"
 *                 manager_id: "67e1a3b4c5d6e7f8a9b0c1d3"
 *                 bins:
 *                   - bin_id: "BIN-001"
 *                     bin_code: "A-1-1"
 *                     rack: "A"
 *                     row: 1
 *                     col: 1
 *                     capacity: 5000
 *                   - bin_id: "BIN-002"
 *                     bin_code: "A-1-2"
 *                     rack: "A"
 *                     row: 1
 *                     col: 2
 *                     capacity: 5000
 *             finished_goods_warehouse:
 *               summary: Finished Goods Warehouse
 *               value:
 *                 warehouse_name: "Finished Goods Store - Switchgear Section"
 *                 warehouse_type: "Finished Goods"
 *                 location: "Building B, Mezzanine Floor"
 *                 manager_id: "67e1a3b4c5d6e7f8a9b0c1d4"
 *                 bins:
 *                   - bin_id: "BIN-FG-001"
 *                     bin_code: "FG-A-01"
 *                     rack: "FG-A"
 *                     row: 1
 *                     col: 1
 *                     capacity: 100
 *     responses:
 *       201:
 *         description: Warehouse created successfully
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
 *                   example: "Warehouse created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Warehouse'
 *       400:
 *         description: Bad request
 *       409:
 *         description: Warehouse already exists
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden
 */
router.post('/', createWarehouse);

/**
 * @swagger
 * /api/warehouses:
 *   get:
 *     summary: Get all warehouses with pagination and filters
 *     tags: [Warehouse & Bin Master]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: ['Raw Material', 'WIP', 'Finished Goods', 'Consumable', 'Tool', 'Scrap', 'Subcontract', 'Quarantine']
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: manager_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: ['asc', 'desc']
 *           default: desc
 *     responses:
 *       200:
 *         description: Warehouses retrieved successfully
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
 *                     $ref: '#/components/schemas/Warehouse'
 *                 pagination:
 *                   type: object
 */
router.get('/', getAllWarehouses);

/**
 * @swagger
 * /api/warehouses/capacity-report:
 *   get:
 *     summary: Get warehouse capacity utilization report
 *     tags: [Warehouse & Bin Master]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Capacity report retrieved successfully
 */
router.get('/capacity-report', getWarehouseCapacityReport);

/**
 * @swagger
 * /api/warehouses/{id}:
 *   get:
 *     summary: Get warehouse by ID with bin details and stock summary
 *     tags: [Warehouse & Bin Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/warehouseIdParam'
 *     responses:
 *       200:
 *         description: Warehouse retrieved successfully
 *       404:
 *         $ref: '#/components/responses/WarehouseNotFound'
 */
router.get('/:id', getWarehouseById);

/**
 * @swagger
 * /api/warehouses/{id}:
 *   put:
 *     summary: Update warehouse details
 *     tags: [Warehouse & Bin Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/warehouseIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               warehouse_name:
 *                 type: string
 *                 example: "Raw Material Store - Copper & Aluminum"
 *                 description: Name of the warehouse
 *               warehouse_type:
 *                 type: string
 *                 enum: ['Raw Material', 'WIP', 'Finished Goods', 'Consumable', 'Tool', 'Scrap', 'Subcontract', 'Quarantine']
 *                 example: "Raw Material"
 *                 description: Type of warehouse (cannot change if stock exists)
 *               location:
 *                 type: string
 *                 example: "Building A, Ground Floor, Section 2 - Updated"
 *                 description: Physical location description
 *               manager_id:
 *                 type: string
 *                 example: "67e1a3b4c5d6e7f8a9b0c1d3"
 *                 description: Store manager responsible for this warehouse
 *               is_active:
 *                 type: boolean
 *                 example: true
 *                 description: Warehouse status (cannot deactivate if stock exists)
 *               bins:
 *                 type: array
 *                 description: Complete bin structure (replaces existing bins)
 *                 items:
 *                   type: object
 *                   required:
 *                     - bin_id
 *                     - bin_code
 *                   properties:
 *                     bin_id:
 *                       type: string
 *                       example: "BIN-001"
 *                       description: Unique bin identifier
 *                     bin_code:
 *                       type: string
 *                       example: "A-1-1"
 *                       description: Short display code for bin labels
 *                     rack:
 *                       type: string
 *                       example: "A"
 *                       description: Rack identifier
 *                     row:
 *                       type: integer
 *                       example: 1
 *                       description: Row number within rack
 *                     col:
 *                       type: integer
 *                       example: 1
 *                       description: Column/bin number within row
 *                     capacity:
 *                       type: number
 *                       example: 5000
 *                       description: Maximum capacity in item's unit
 *                     is_active:
 *                       type: boolean
 *                       example: true
 *                       description: Bin status
 *           examples:
 *             update_basic:
 *               summary: Update basic info only
 *               value:
 *                 warehouse_name: "Raw Material Store - Updated Name"
 *                 location: "New Location - Building C"
 *                 manager_id: "67e1a3b4c5d6e7f8a9b0c1d5"
 *                 is_active: false
 *             update_with_type:
 *               summary: Update warehouse type
 *               value:
 *                 warehouse_type: "Consumable"
 *                 location: "Consumables Section"
 *             full_update:
 *               summary: Full warehouse update with bins
 *               value:
 *                 warehouse_name: "Raw Material Store - Copper & Aluminum"
 *                 warehouse_type: "Raw Material"
 *                 location: "Building A, Ground Floor, Section 2"
 *                 manager_id: "67e1a3b4c5d6e7f8a9b0c1d3"
 *                 is_active: true
 *                 bins:
 *                   - bin_id: "BIN-001"
 *                     bin_code: "A-1-1"
 *                     rack: "A"
 *                     row: 1
 *                     col: 1
 *                     capacity: 5000
 *                     is_active: true
 *                   - bin_id: "BIN-002"
 *                     bin_code: "A-1-2"
 *                     rack: "A"
 *                     row: 1
 *                     col: 2
 *                     capacity: 5000
 *                     is_active: true
 *                   - bin_id: "BIN-003"
 *                     bin_code: "B-1-1"
 *                     rack: "B"
 *                     row: 1
 *                     col: 1
 *                     capacity: 3000
 *                     is_active: true
 *             update_bins_only:
 *               summary: Update only bins
 *               value:
 *                 bins:
 *                   - bin_id: "BIN-001"
 *                     bin_code: "A-1-1"
 *                     rack: "A"
 *                     row: 1
 *                     col: 1
 *                     capacity: 6000
 *                     is_active: true
 *                   - bin_id: "BIN-004"
 *                     bin_code: "C-1-1"
 *                     rack: "C"
 *                     row: 1
 *                     col: 1
 *                     capacity: 4000
 *                     is_active: true
 *             deactivate_warehouse:
 *               summary: Deactivate warehouse
 *               value:
 *                 is_active: false
 *                 remarks: "Warehouse closed for renovation"
 *     responses:
 *       200:
 *         description: Warehouse updated successfully
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
 *                   example: "Warehouse updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Warehouse'
 *       400:
 *         description: Cannot deactivate warehouse with stock or invalid operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Cannot deactivate warehouse with existing stock. Transfer or issue all stock first."
 *                 error:
 *                   type: string
 *                   example: "WAREHOUSE_HAS_STOCK"
 *       404:
 *         $ref: '#/components/responses/WarehouseNotFound'
 *       409:
 *         description: Duplicate warehouse name or ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Warehouse name or ID already exists"
 *                 error:
 *                   type: string
 *                   example: "DUPLICATE_WAREHOUSE"
 */
router.put('/:id', updateWarehouse);

// ======================================================
// BIN APIs
// ======================================================

/**
 * @swagger
 * /api/warehouses/{id}/bins:
 *   post:
 *     summary: Add a new bin to warehouse
 *     tags: [Warehouse & Bin Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/warehouseIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BinCreate'
 *     responses:
 *       201:
 *         description: Bin added successfully
 *       400:
 *         description: Duplicate bin ID
 *       404:
 *         $ref: '#/components/responses/WarehouseNotFound'
 */
router.post('/:id/bins', addBin);

/**
 * @swagger
 * /api/warehouses/{id}/bins:
 *   get:
 *     summary: Get all bins in warehouse with stock information
 *     tags: [Warehouse & Bin Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/warehouseIdParam'
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: has_capacity
 *         schema:
 *           type: boolean
 *         description: Filter bins with available capacity
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by bin_code or bin_id
 *     responses:
 *       200:
 *         description: Bins retrieved successfully
 */
router.get('/:id/bins', getWarehouseBins);

/**
 * @swagger
 * /api/warehouses/{id}/available-bins:
 *   get:
 *     summary: Get available bins for stock receipt
 *     tags: [Warehouse & Bin Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/warehouseIdParam'
 *       - in: query
 *         name: quantity
 *         schema:
 *           type: number
 *         description: Required quantity to store
 *       - in: query
 *         name: item_id
 *         schema:
 *           type: string
 *         description: Item ID (for compatibility)
 *     responses:
 *       200:
 *         description: Available bins retrieved successfully
 */
router.get('/:id/available-bins', getAvailableBins);

/**
 * @swagger
 * /api/warehouses/{warehouseId}/bins/{binId}:
 *   put:
 *     summary: Update bin details
 *     tags: [Warehouse & Bin Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: warehouseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: binId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bin_code:
 *                 type: string
 *               rack:
 *                 type: string
 *               row:
 *                 type: integer
 *               col:
 *                 type: integer
 *               capacity:
 *                 type: number
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Bin updated successfully
 *       400:
 *         description: Cannot deactivate bin with stock
 *       404:
 *         description: Warehouse or bin not found
 */
router.put('/:warehouseId/bins/:binId', updateBin);

/**
 * @swagger
 * /api/warehouses/{warehouseId}/bins/{binId}:
 *   delete:
 *     summary: Deactivate bin (soft delete)
 *     tags: [Warehouse & Bin Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: warehouseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: binId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bin deactivated successfully
 *       400:
 *         description: Cannot delete bin with stock
 *       404:
 *         description: Warehouse or bin not found
 */
router.delete('/:warehouseId/bins/:binId', deleteBin);

/**
 * @swagger
 * /api/warehouses/{id}:
 *   delete:
 *     summary: Hard delete warehouse (only if no stock and no transactions)
 *     tags: [Warehouse & Bin Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Warehouse ID
 *     responses:
 *       200:
 *         description: Warehouse deleted successfully
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
 *                   example: "Warehouse WH-RM01 deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     warehouse_id:
 *                       type: string
 *                     warehouse_name:
 *                       type: string
 *                     warehouse_type:
 *                       type: string
 *                     total_bins:
 *                       type: integer
 *                     active_bins:
 *                       type: integer
 *                     deleted_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Cannot delete warehouse with stock or transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Cannot delete warehouse with existing stock. Transfer or issue all stock first."
 *                 error:
 *                   type: string
 *                   example: "WAREHOUSE_HAS_STOCK"
 *       404:
 *         description: Warehouse not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/:id', deleteWarehouse);

module.exports = router;