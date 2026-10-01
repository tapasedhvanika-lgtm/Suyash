// const mongoose = require('mongoose');

// // Address Snapshot Schema
// const addressSnapshotSchema = new mongoose.Schema({
//   line1: { type: String, default: '' },
//   line2: { type: String, default: '' },
//   city: { type: String, default: '' },
//   district: { type: String, default: '' },
//   state: { type: String, default: '' },
//   state_code: { type: Number, default: 0 },
//   pincode: { type: String, default: '' },
//   country: { type: String, default: 'India' }
// }, { _id: false });

// // DC Item Schema — secondary_qty/unit/item_process_remark belong HERE (per item)
// const dcItemSchema = new mongoose.Schema({
//   so_item_id: { type: mongoose.Schema.Types.ObjectId, required: true },
//   part_no: { type: String, required: true, uppercase: true },
//   part_name: { type: String, required: false },
//   hsn_code: { type: String, required: false },
//   dispatch_qty: { type: Number, required: true, min: 0.001 },
//   unit: { type: String, enum: ['Nos', 'Kg', 'Meter', 'Set', 'Piece'], required: true },
//   unit_price: { type: Number, default: 0 },
//   taxable_value: { type: Number, default: 0 },
//   batch_no: { type: String },
//   serial_numbers: [{ type: String }],
//   qc_passed: { type: Boolean, default: false },
//   quality_cert_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QualityCertificate' },
//   packing_list_line: { type: Number },
//   remarks: { type: String },
//   secondary_qty: { type: Number, default: 0 },
//   secondary_unit: { type: String, default: '' },
//   item_process_remark: { type: String, default: '' },
//   // ✅ ADD THESE TWO FIELDS
//   bom_weight_kg: { type: Number, default: 0 },  // System weight from BOM
//   item_weight_kg: { type: Number, default: 0 }   // Standard weight from Item Master
// });

// // Transport Schema
// const transportSchema = new mongoose.Schema({
//   dispatch_through: { type: String, default: '' },
//   dispatch_mode: {
//     type: String,
//     enum: ['', 'Road', 'Rail', 'Air', 'Sea', 'Hand Delivery', 'Courier'],
//     default: ''
//   },
//   transporter_name: { type: String, default: '' },
//   transporter_gstin: { type: String, default: '' },
//   transporter_id_ewb: { type: String, default: '' },
//   vehicle_no: { type: String, default: '' },
//   vehicle_type: {
//     type: String,
//     enum: ['', 'Regular', 'Over Dimensional Cargo (ODC)', 'Water Vessel', 'Air Cargo'],
//     default: ''
//   },
//   lr_number: { type: String, default: '' },
//   lr_date: { type: Date },
//   awb_number: { type: String, default: '' },
//   courier_tracking_no: { type: String, default: '' },
//   freight_terms: {
//     type: String,
//     enum: ['', 'Freight Paid', 'Freight To Pay', 'Freight Prepaid & Charged', 'Ex-Works'],
//     default: ''
//   },
//   freight_amount: { type: Number, default: 0 },
//   insurance_required: { type: Boolean, default: false },
//   insurance_amount: { type: Number, default: 0 },
//   insurance_policy_no: { type: String, default: '' }
// });

// // Packing Schema
// const packingSchema = new mongoose.Schema({
//   no_of_packages: { type: Number, default: 1, min: 1 },
//   gross_weight_kg: { type: Number, default: 0 },
//   net_weight_kg: { type: Number, default: 0 },
//   packing_type: {
//     type: String,
//     enum: ['Cardboard Box', 'Wooden Crate', 'Pallet', 'Gunny Bag', 'Bare Bundle', 'Polybag', 'Drum'],
//     default: 'Cardboard Box'
//   },
//   packing_details: { type: String, default: '' },
//   dimension_l_mm: { type: Number, default: 0 },
//   dimension_w_mm: { type: Number, default: 0 },
//   dimension_h_mm: { type: Number, default: 0 },
//   volumetric_weight_kg: { type: Number, default: 0 }
// }, { _id: false });

// // e-Way Bill Schema
// const ewayBillSchema = new mongoose.Schema({
//   eway_bill_required: { type: Boolean, default: false },
//   eway_bill_number: { type: String },
//   eway_bill_date: { type: Date },
//   eway_bill_validity_date: { type: Date },
//   eway_bill_generated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   eway_bill_mode: { type: String, enum: ['Portal', 'API', 'API (Mock)', 'Manual', 'Auto-Manual'] },
//   eway_bill_status: {
//     type: String,
//     enum: ['Not Required', 'Pending', 'Generated', 'Extended', 'Cancelled', 'Verified'],
//     default: 'Not Required'
//   },
//   eway_bill_cancel_reason: { type: String },
//   eway_bill_part_b_updated: { type: Boolean, default: false },
//   auto_generated: { type: Boolean, default: false },
//   generation_reason: { type: String }
// });

// // POD Schema
// const podSchema = new mongoose.Schema({
//   expected_delivery_date: { type: Date },
//   actual_delivery_date: { type: Date },
//   pod_received: { type: Boolean, default: false },
//   pod_date: { type: Date },
//   pod_signed_by: { type: String },
//   pod_file_path: { type: String },
//   delivery_remarks: { type: String }
// });

// // Gate Pass Schema
// const gatePassSchema = new mongoose.Schema({
//   gate_pass_no: { type: String },
//   gate_pass_time: { type: Date },
//   security_officer: { type: String },
//   dispatched_at: { type: Date },
//   dispatch_confirmed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
// });

// // ✅ REMOVED nature_of_processing from jobWorkSchema to avoid duplication
// const jobWorkSchema = new mongoose.Schema({
//   duration_of_process_days: { type: Number, default: 0, min: 0 },
//   destination: { type: String, default: '' }
// }, { _id: false });

// // Challan Meta Schema
// const challanMetaSchema = new mongoose.Schema({
//   challan_series: { type: String, default: '' },
//   reference_no: { type: String, default: '' },
//   reference_date: { type: Date },
//   buyer_order_no: { type: String, default: '' },
//   buyer_order_date: { type: Date },
//   dispatch_doc_no: { type: String, default: '' },
//   other_references: { type: String, default: '' },
//   payment_terms: { type: String, default: '30 Days' },
//   company_email: { type: String, default: '' },
//   company_pan: { type: String, default: '' }
// }, { _id: false });

// // ==================== MAIN SCHEMA ====================
// const deliveryChallanSchema = new mongoose.Schema({
//   dc_number: { type: String, unique: true },
//   dc_date: { type: Date, default: Date.now, required: true },
  
//   // ✅ nature_of_processing in main schema only (no duplication)
//   nature_of_processing: {
//     type: String,
//     enum: [
//       'Chamfer',
//       'Zinc blue plating',
//       'Yellow plating',
//       'Brazing',
//       'Dimple and forming',
//       'Hardening',
//       'Paint',
//       'Phosphating',
//       'Tapping',
//       'Blackodising',
//       'Machining',
//       'Thin plating',
//       'Silver Plating',
//       'Not Specified'
//     ],
//     required: true,
//     default: 'Not Specified'
//   },

//   // Links
//  // Links
// so_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder', required: false, index: true },  // ✅ Made optional
// so_number: { type: String, required: false },  
//   customer_po_number: { type: String },
//   invoice_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesInvoice' },

//   // Seller (Consignor)
//   company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
//   company_name: { type: String, required: true },
//   company_gstin: { type: String, required: true },
//   company_address: { type: addressSnapshotSchema, required: true },

//   // Buyer (Consignee)
//   customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
//   customer_name: { type: String, required: true },
//   customer_gstin: { type: String },
//   ship_from: { type: addressSnapshotSchema, required: true },
//   ship_to: { type: addressSnapshotSchema, required: true },
//   billing_address: { type: addressSnapshotSchema },

//   // GST Type
//   gst_type: { type: String, enum: ['CGST/SGST', 'IGST'], default: 'CGST/SGST' },

//   // Items
//   items: [dcItemSchema],

//   // Sub-documents
//   transport: { type: transportSchema, default: () => ({}) },
//   packing: { type: [packingSchema], default: () => [] },
//   eway_bill: { type: ewayBillSchema, default: () => ({}) },
//   gate_pass: { type: gatePassSchema, default: () => ({}) },
//   pod: { type: podSchema, default: () => ({}) },

//   // Job Work and Challan Meta
//   job_work: { type: jobWorkSchema, default: () => ({}) },
//   challan_meta: { type: challanMetaSchema, default: () => ({}) },

//   // Status
//   status: {
//     type: String,
//     enum: [
//       'Planned', 'Packing In Progress', 'Packed', 'EWB Generated',
//       'Dispatched', 'In Transit', 'Delivered', 'Partially Delivered',
//       'Rejected by Customer', 'Returned', 'Cancelled'
//     ],
//     default: 'Planned',
//     index: true
//   },
//   rejection_reason: { type: String },
//   return_dc_id: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryChallan' },
//   is_active: { type: Boolean, default: true },

//   // Audit
//   created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
// }, { timestamps: true });

// // ==================== INDEXES ====================
// deliveryChallanSchema.index({ dc_number: 1 });
// deliveryChallanSchema.index({ so_id: 1, status: 1 });
// deliveryChallanSchema.index({ customer_id: 1, status: 1 });
// deliveryChallanSchema.index({ 'pod.expected_delivery_date': 1, status: 1 });
// deliveryChallanSchema.index({ createdAt: -1 });
// deliveryChallanSchema.index({ 'eway_bill.eway_bill_number': 1 });

// // ==================== VIRTUALS ====================
// deliveryChallanSchema.virtual('total_value').get(function () {
//   return this.items.reduce((sum, item) => sum + (item.taxable_value || 0), 0);
// });

// deliveryChallanSchema.virtual('total_quantity').get(function () {
//   return this.items.reduce((sum, item) => sum + item.dispatch_qty, 0);
// });

// deliveryChallanSchema.virtual('is_ewaybill_overdue').get(function () {
//   if (!this.eway_bill.eway_bill_validity_date) return false;
//   if (this.status === 'Delivered') return false;
//   return new Date() > new Date(this.eway_bill.eway_bill_validity_date);
// });

// // ==================== MIDDLEWARE ====================
// deliveryChallanSchema.pre('save', async function (next) {
//   for (const item of this.items) {
//     if (item.dispatch_qty && item.unit_price && !item.taxable_value) {
//       item.taxable_value = +(item.dispatch_qty * item.unit_price).toFixed(2);
//     }
//   }
//   next();
// });

// // ==================== STATIC METHODS ====================
// deliveryChallanSchema.statics.generateDCNumber = async function () {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, '0');
//   const prefix = `DC-${year}${month}`;

//   const lastDC = await this.findOne({ dc_number: new RegExp(`^${prefix}`) })
//     .sort({ dc_number: -1 });

//   let sequence = 1;
//   if (lastDC && lastDC.dc_number) {
//     const parts = lastDC.dc_number.split('-');
//     const lastSeq = parseInt(parts[2]);
//     if (!isNaN(lastSeq)) sequence = lastSeq + 1;
//   }

//   return `${prefix}-${String(sequence).padStart(4, '0')}`;
// };

// deliveryChallanSchema.statics.findOverduePOD = async function () {
//   const today = new Date();
//   return this.find({
//     status: 'Dispatched',
//     'pod.expected_delivery_date': { $lt: today },
//     'pod.pod_received': false
//   }).populate('customer_id', 'customer_name');
// };

// const DeliveryChallan = mongoose.model('DeliveryChallan', deliveryChallanSchema);
// module.exports = DeliveryChallan;





// const mongoose = require('mongoose');

// // Address Snapshot Schema
// const addressSnapshotSchema = new mongoose.Schema({
//   line1: { type: String, default: '' },
//   line2: { type: String, default: '' },
//   city: { type: String, default: '' ,required:false},
//   district: { type: String, default: '',required:false },
//   state: { type: String, default: '' ,required:false},
//   state_code: { type: Number, default: 0,required:false },
//   // pincode: { type: String, default: '',required:false },
//     pincode: { type: String, default: '' },
//   country: { type: String, default: 'India',required:false }
// }, { _id: false });

// // DC Item Schema — secondary_qty/unit/item_process_remark belong HERE (per item)
// const dcItemSchema = new mongoose.Schema({
//   so_item_id: { type: mongoose.Schema.Types.ObjectId, required: true },
//   part_no: { type: String, required: true, uppercase: true },
//   part_name: { type: String, required: true },
//   hsn_code: { type: String, required: false },
//   dispatch_qty: { type: Number, required: true, min: 0.001 },
//   unit: { type: String, enum: ['Nos', 'Kg', 'Meter', 'Set', 'Piece'], required: true },
//   unit_price: { type: Number, default: 0 },
//   taxable_value: { type: Number, default: 0 },
//   batch_no: { type: String },
//   serial_numbers: [{ type: String }],
//   qc_passed: { type: Boolean, default: false },
//   quality_cert_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QualityCertificate' },
//   packing_list_line: { type: Number },
//   remarks: { type: String },
//   secondary_qty: { type: Number, default: 0 },
//   secondary_unit: { type: String, default: '' },
//   item_process_remark: { type: String, default: '' },
//   //  ADD THESE TWO FIELDS
//   bom_weight_kg: { type: Number, default: 0 },  // System weight from BOM
//   item_weight_kg: { type: Number, default: 0 }   // Standard weight from Item Master
// });

// // Transport Schema
// const transportSchema = new mongoose.Schema({
//   dispatch_through: { type: String, default: '' },
//   dispatch_mode: {
//     type: String,
//     enum: ['', 'Road', 'Rail', 'Air', 'Sea', 'Hand Delivery', 'Courier'],
//     default: ''
//   },
//   transporter_name: { type: String, default: '' },
//   transporter_gstin: { type: String, default: '' },
//   transporter_id_ewb: { type: String, default: '' },
//   vehicle_no: { type: String, default: '' },
//   vehicle_type: {
//     type: String,
//     enum: ['', 'Regular', 'Over Dimensional Cargo (ODC)', 'Water Vessel', 'Air Cargo'],
//     default: ''
//   },
//   lr_number: { type: String, default: '' },
//   lr_date: { type: Date },
//   awb_number: { type: String, default: '' },
//   courier_tracking_no: { type: String, default: '' },
//   freight_terms: {
//     type: String,
//     enum: ['', 'Freight Paid', 'Freight To Pay', 'Freight Prepaid & Charged', 'Ex-Works'],
//     default: ''
//   },
//   freight_amount: { type: Number, default: 0 },
//   insurance_required: { type: Boolean, default: false },
//   insurance_amount: { type: Number, default: 0 },
//   insurance_policy_no: { type: String, default: '' }
// });

// // Packing Schema
// const packingSchema = new mongoose.Schema({
//   no_of_packages: { type: Number, default: 1, min: 1 },
//   gross_weight_kg: { type: Number, default: 0 },
//   net_weight_kg: { type: Number, default: 0 },
//   packing_type: {
//     type: String,
//     enum: ['Cardboard Box', 'Wooden Crate', 'Pallet', 'Gunny Bag', 'Bare Bundle', 'Polybag', 'Drum','Tray'],
//     default: 'Cardboard Box'
//   },
//   packing_details: { type: String, default: '' },
//   dimension_l_mm: { type: Number, default: 0 },
//   dimension_w_mm: { type: Number, default: 0 },
//   dimension_h_mm: { type: Number, default: 0 },
//   volumetric_weight_kg: { type: Number, default: 0 }
// }, { _id: false });

// // e-Way Bill Schema
// const ewayBillSchema = new mongoose.Schema({
//   eway_bill_required: { type: Boolean, default: false },
//   eway_bill_number: { type: String },
//   eway_bill_date: { type: Date },
//   eway_bill_validity_date: { type: Date },
//   eway_bill_generated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   eway_bill_mode: { type: String, enum: ['Portal', 'API', 'API (Mock)', 'Manual', 'Auto-Manual'] },
//   eway_bill_status: {
//     type: String,
//     enum: ['Not Required', 'Pending', 'Generated', 'Extended', 'Cancelled', 'Verified'],
//     default: 'Not Required'
//   },
//   eway_bill_cancel_reason: { type: String },
//   eway_bill_part_b_updated: { type: Boolean, default: false },
//   auto_generated: { type: Boolean, default: false },
//   generation_reason: { type: String }
// });

// // POD Schema
// const podSchema = new mongoose.Schema({
//   expected_delivery_date: { type: Date },
//   actual_delivery_date: { type: Date },
//   pod_received: { type: Boolean, default: false },
//   pod_date: { type: Date },
//   pod_signed_by: { type: String },
//   pod_file_path: { type: String },
//   delivery_remarks: { type: String }
// });

// // Gate Pass Schema
// const gatePassSchema = new mongoose.Schema({
//   gate_pass_no: { type: String },
//   gate_pass_time: { type: Date },
//   security_officer: { type: String },
//   dispatched_at: { type: Date },
//   dispatch_confirmed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
// });

// // ✅ REMOVED nature_of_processing from jobWorkSchema to avoid duplication
// const jobWorkSchema = new mongoose.Schema({
//   duration_of_process_days: { type: Number, default: 0, min: 0 },
//   destination: { type: String, default: '' }
// }, { _id: false });

// // Challan Meta Schema
// const challanMetaSchema = new mongoose.Schema({
//   challan_series: { type: String, default: '' },
//   reference_no: { type: String, default: '' },
//   reference_date: { type: Date },
//   buyer_order_no: { type: String, default: '' },
//   buyer_order_date: { type: Date },
//   dispatch_doc_no: { type: String, default: '' },
//   other_references: { type: String, default: '' },
//   payment_terms: { type: String, default: '30 Days' },
//   company_email: { type: String, default: '' },
//   company_pan: { type: String, default: '' }
// }, { _id: false });

// // ==================== MAIN SCHEMA ====================
// const deliveryChallanSchema = new mongoose.Schema({
//   dc_number: { type: String, unique: true },
//   dc_date: { type: Date, default: Date.now, required: true },
  
//   // ✅ nature_of_processing in main schema only (no duplication)
//   nature_of_processing: {
//     type: String,
//     enum: [
//       'Chamfer',
//       'Zinc blue plating',
//       'Yellow plating',
//       'Brazing',
//       'Dimple and forming',
//       'Hardening',
//       'Paint',
//       'Phosphating',
//       'Tapping',
//       'Blackodising',
//       'Machining',
//       'Thin plating',
//       'Silver Plating',
//       'Not Specified'
//     ],
//     required: true,
//     default: 'Not Specified'
//   },

//   // Links
//  // Links
// so_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder', required: false, index: true },  // ✅ Made optional
// so_number: { type: String, required: false },  
//   customer_po_number: { type: String },
//   invoice_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesInvoice' },

//   // Seller (Consignor)
//   company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
//   company_name: { type: String, required: true },
//   company_gstin: { type: String, required: true },
//   company_address: { type: addressSnapshotSchema, required: true },

//   // Buyer (Consignee)
//   customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
//   customer_name: { type: String, required: true },
//   customer_gstin: { type: String },
//   ship_from: { type: addressSnapshotSchema, required: false },
//   ship_to: { type: addressSnapshotSchema, required: false },
//   billing_address: { type: addressSnapshotSchema },

//   // GST Type
//   gst_type: { type: String, enum: ['CGST/SGST', 'IGST'], default: 'CGST/SGST' },

//   // Items
//   items: [dcItemSchema],

//   // Sub-documents
//   transport: { type: transportSchema, default: () => ({}) },
//   packing: { type: [packingSchema], default: () => [] },
//   eway_bill: { type: ewayBillSchema, default: () => ({}) },
//   gate_pass: { type: gatePassSchema, default: () => ({}) },
//   pod: { type: podSchema, default: () => ({}) },

//   // Job Work and Challan Meta
//   job_work: { type: jobWorkSchema, default: () => ({}) },
//   challan_meta: { type: challanMetaSchema, default: () => ({}) },

//   // Status
//   status: {
//     type: String,
//     enum: [
//       'Planned', 'Packing In Progress', 'Packed', 'EWB Generated',
//       'Dispatched', 'In Transit', 'Delivered', 'Partially Delivered',
//       'Rejected by Customer', 'Returned', 'Cancelled'
//     ],
//     default: 'Planned',
//     index: true
//   },
//   rejection_reason: { type: String },
//   return_dc_id: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryChallan' },
//   is_active: { type: Boolean, default: true },

//   // Audit
//   created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
// }, { timestamps: true });

// // ==================== INDEXES ====================
// deliveryChallanSchema.index({ dc_number: 1 });
// deliveryChallanSchema.index({ so_id: 1, status: 1 });
// deliveryChallanSchema.index({ customer_id: 1, status: 1 });
// deliveryChallanSchema.index({ 'pod.expected_delivery_date': 1, status: 1 });
// deliveryChallanSchema.index({ createdAt: -1 });
// deliveryChallanSchema.index({ 'eway_bill.eway_bill_number': 1 });

// // ==================== VIRTUALS ====================
// deliveryChallanSchema.virtual('total_value').get(function () {
//   return this.items.reduce((sum, item) => sum + (item.taxable_value || 0), 0);
// });
  
// deliveryChallanSchema.virtual('total_quantity').get(function () {
//   return this.items.reduce((sum, item) => sum + item.dispatch_qty, 0);
// });

// deliveryChallanSchema.virtual('is_ewaybill_overdue').get(function () {
//   if (!this.eway_bill.eway_bill_validity_date) return false;
//   if (this.status === 'Delivered') return false;
//   return new Date() > new Date(this.eway_bill.eway_bill_validity_date);
// });

// deliveryChallanSchema.pre('save', async function (next) {
//   for (const item of this.items) {
//     if (item.dispatch_qty && item.unit_price && !item.taxable_value) {
//       item.taxable_value = +(item.dispatch_qty * item.unit_price).toFixed(2);
//     }
//   }
//   next();
// });

// // ==================== STATIC METHODS ====================
// deliveryChallanSchema.statics.generateDCNumber = async function () {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, '0');
//   const prefix = `DC-${year}${month}`;

//   const lastDC = await this.findOne({ dc_number: new RegExp(`^${prefix}`) })
//     .sort({ dc_number: -1 });

//   let sequence = 1;
//   if (lastDC && lastDC.dc_number) {
//     const parts = lastDC.dc_number.split('-');
//     const lastSeq = parseInt(parts[2]);
//     if (!isNaN(lastSeq)) sequence = lastSeq + 1;
//   }

//   return `${prefix}-${String(sequence).padStart(4, '0')}`;
// };

// deliveryChallanSchema.statics.findOverduePOD = async function () {
//   const today = new Date();
//   return this.find({
//     status: 'Dispatched',
//     'pod.expected_delivery_date': { $lt: today },
//     'pod.pod_received': false
//   }).populate('customer_id', 'customer_name');
// };

// const DeliveryChallan = mongoose.model('DeliveryChallan', deliveryChallanSchema);
// module.exports = DeliveryChallan;


// const mongoose = require('mongoose');

// // Address Snapshot Schema
// const addressSnapshotSchema = new mongoose.Schema({
//   line1: { type: String, default: '' },
//   line2: { type: String, default: '' },
//   city: { type: String, default: '' },
//   district: { type: String, default: '' },
//   state: { type: String, default: '' },
//   state_code: { type: Number, default: 0 },
//   pincode: { type: String, default: '' },
//   country: { type: String, default: 'India' }
// }, { _id: false });

// // DC Item Schema — secondary_qty/unit/item_process_remark belong HERE (per item)
// const dcItemSchema = new mongoose.Schema({
//   so_item_id: { type: mongoose.Schema.Types.ObjectId, required: true },
//   part_no: { type: String, required: true, uppercase: true },
//   part_name: { type: String, required: false },
//   hsn_code: { type: String, required: false },
//   dispatch_qty: { type: Number, required: true, min: 0.001 },
//   unit: { type: String, enum: ['Nos', 'Kg', 'Meter', 'Set', 'Piece'], required: true },
//   unit_price: { type: Number, default: 0 },
//   taxable_value: { type: Number, default: 0 },
//   batch_no: { type: String },
//   serial_numbers: [{ type: String }],
//   qc_passed: { type: Boolean, default: false },
//   quality_cert_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QualityCertificate' },
//   packing_list_line: { type: Number },
//   remarks: { type: String },
//   secondary_qty: { type: Number, default: 0 },
//   secondary_unit: { type: String, default: '' },
//   item_process_remark: { type: String, default: '' },
//   // ✅ ADD THESE TWO FIELDS
//   bom_weight_kg: { type: Number, default: 0 },  // System weight from BOM
//   item_weight_kg: { type: Number, default: 0 }   // Standard weight from Item Master
// });

// // Transport Schema
// const transportSchema = new mongoose.Schema({
//   dispatch_through: { type: String, default: '' },
//   dispatch_mode: {
//     type: String,
//     enum: ['', 'Road', 'Rail', 'Air', 'Sea', 'Hand Delivery', 'Courier'],
//     default: ''
//   },
//   transporter_name: { type: String, default: '' },
//   transporter_gstin: { type: String, default: '' },
//   transporter_id_ewb: { type: String, default: '' },
//   vehicle_no: { type: String, default: '' },
//   vehicle_type: {
//     type: String,
//     enum: ['', 'Regular', 'Over Dimensional Cargo (ODC)', 'Water Vessel', 'Air Cargo'],
//     default: ''
//   },
//   lr_number: { type: String, default: '' },
//   lr_date: { type: Date },
//   awb_number: { type: String, default: '' },
//   courier_tracking_no: { type: String, default: '' },
//   freight_terms: {
//     type: String,
//     enum: ['', 'Freight Paid', 'Freight To Pay', 'Freight Prepaid & Charged', 'Ex-Works'],
//     default: ''
//   },
//   freight_amount: { type: Number, default: 0 },
//   insurance_required: { type: Boolean, default: false },
//   insurance_amount: { type: Number, default: 0 },
//   insurance_policy_no: { type: String, default: '' }
// });

// // Packing Schema
// const packingSchema = new mongoose.Schema({
//   no_of_packages: { type: Number, default: 1, min: 1 },
//   gross_weight_kg: { type: Number, default: 0 },
//   net_weight_kg: { type: Number, default: 0 },
//   packing_type: {
//     type: String,
//     enum: ['Cardboard Box', 'Wooden Crate', 'Pallet', 'Gunny Bag', 'Bare Bundle', 'Polybag', 'Drum'],
//     default: 'Cardboard Box'
//   },
//   packing_details: { type: String, default: '' },
//   dimension_l_mm: { type: Number, default: 0 },
//   dimension_w_mm: { type: Number, default: 0 },
//   dimension_h_mm: { type: Number, default: 0 },
//   volumetric_weight_kg: { type: Number, default: 0 }
// }, { _id: false });

// // e-Way Bill Schema
// const ewayBillSchema = new mongoose.Schema({
//   eway_bill_required: { type: Boolean, default: false },
//   eway_bill_number: { type: String },
//   eway_bill_date: { type: Date },
//   eway_bill_validity_date: { type: Date },
//   eway_bill_generated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   eway_bill_mode: { type: String, enum: ['Portal', 'API', 'API (Mock)', 'Manual', 'Auto-Manual'] },
//   eway_bill_status: {
//     type: String,
//     enum: ['Not Required', 'Pending', 'Generated', 'Extended', 'Cancelled', 'Verified'],
//     default: 'Not Required'
//   },
//   eway_bill_cancel_reason: { type: String },
//   eway_bill_part_b_updated: { type: Boolean, default: false },
//   auto_generated: { type: Boolean, default: false },
//   generation_reason: { type: String }
// });

// // POD Schema
// const podSchema = new mongoose.Schema({
//   expected_delivery_date: { type: Date },
//   actual_delivery_date: { type: Date },
//   pod_received: { type: Boolean, default: false },
//   pod_date: { type: Date },
//   pod_signed_by: { type: String },
//   pod_file_path: { type: String },
//   delivery_remarks: { type: String }
// });

// // Gate Pass Schema
// const gatePassSchema = new mongoose.Schema({
//   gate_pass_no: { type: String },
//   gate_pass_time: { type: Date },
//   security_officer: { type: String },
//   dispatched_at: { type: Date },
//   dispatch_confirmed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
// });

// // ✅ REMOVED nature_of_processing from jobWorkSchema to avoid duplication
// const jobWorkSchema = new mongoose.Schema({
//   duration_of_process_days: { type: Number, default: 0, min: 0 },
//   destination: { type: String, default: '' }
// }, { _id: false });

// // Challan Meta Schema
// const challanMetaSchema = new mongoose.Schema({
//   challan_series: { type: String, default: '' },
//   reference_no: { type: String, default: '' },
//   reference_date: { type: Date },
//   buyer_order_no: { type: String, default: '' },
//   buyer_order_date: { type: Date },
//   dispatch_doc_no: { type: String, default: '' },
//   other_references: { type: String, default: '' },
//   payment_terms: { type: String, default: '30 Days' },
//   company_email: { type: String, default: '' },
//   company_pan: { type: String, default: '' }
// }, { _id: false });

// // ==================== MAIN SCHEMA ====================
// const deliveryChallanSchema = new mongoose.Schema({
//   dc_number: { type: String, unique: true },
//   dc_date: { type: Date, default: Date.now, required: true },
  
//   // ✅ nature_of_processing in main schema only (no duplication)
//   nature_of_processing: {
//     type: String,
//     enum: [
//       'Chamfer',
//       'Zinc blue plating',
//       'Yellow plating',
//       'Brazing',
//       'Dimple and forming',
//       'Hardening',
//       'Paint',
//       'Phosphating',
//       'Tapping',
//       'Blackodising',
//       'Machining',
//       'Thin plating',
//       'Silver Plating',
//       'Not Specified'
//     ],
//     required: true,
//     default: 'Not Specified'
//   },

//   // Links
//  // Links
// so_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder', required: false, index: true },  // ✅ Made optional
// so_number: { type: String, required: false },  
//   customer_po_number: { type: String },
//   invoice_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesInvoice' },

//   // Seller (Consignor)
//   company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
//   company_name: { type: String, required: true },
//   company_gstin: { type: String, required: true },
//   company_address: { type: addressSnapshotSchema, required: true },

//   // Buyer (Consignee)
//   customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
//   customer_name: { type: String, required: true },
//   customer_gstin: { type: String },
//   ship_from: { type: addressSnapshotSchema, required: true },
//   ship_to: { type: addressSnapshotSchema, required: true },
//   billing_address: { type: addressSnapshotSchema },

//   // GST Type
//   gst_type: { type: String, enum: ['CGST/SGST', 'IGST'], default: 'CGST/SGST' },

//   // Items
//   items: [dcItemSchema],

//   // Sub-documents
//   transport: { type: transportSchema, default: () => ({}) },
//   packing: { type: [packingSchema], default: () => [] },
//   eway_bill: { type: ewayBillSchema, default: () => ({}) },
//   gate_pass: { type: gatePassSchema, default: () => ({}) },
//   pod: { type: podSchema, default: () => ({}) },

//   // Job Work and Challan Meta
//   job_work: { type: jobWorkSchema, default: () => ({}) },
//   challan_meta: { type: challanMetaSchema, default: () => ({}) },

//   // Status
//   status: {
//     type: String,
//     enum: [
//       'Planned', 'Packing In Progress', 'Packed', 'EWB Generated',
//       'Dispatched', 'In Transit', 'Delivered', 'Partially Delivered',
//       'Rejected by Customer', 'Returned', 'Cancelled'
//     ],
//     default: 'Planned',
//     index: true
//   },
//   rejection_reason: { type: String },
//   return_dc_id: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryChallan' },
//   is_active: { type: Boolean, default: true },

//   // Audit
//   created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
// }, { timestamps: true });

// // ==================== INDEXES ====================
// deliveryChallanSchema.index({ dc_number: 1 });
// deliveryChallanSchema.index({ so_id: 1, status: 1 });
// deliveryChallanSchema.index({ customer_id: 1, status: 1 });
// deliveryChallanSchema.index({ 'pod.expected_delivery_date': 1, status: 1 });
// deliveryChallanSchema.index({ createdAt: -1 });
// deliveryChallanSchema.index({ 'eway_bill.eway_bill_number': 1 });

// // ==================== VIRTUALS ====================
// deliveryChallanSchema.virtual('total_value').get(function () {
//   return this.items.reduce((sum, item) => sum + (item.taxable_value || 0), 0);
// });

// deliveryChallanSchema.virtual('total_quantity').get(function () {
//   return this.items.reduce((sum, item) => sum + item.dispatch_qty, 0);
// });

// deliveryChallanSchema.virtual('is_ewaybill_overdue').get(function () {
//   if (!this.eway_bill.eway_bill_validity_date) return false;
//   if (this.status === 'Delivered') return false;
//   return new Date() > new Date(this.eway_bill.eway_bill_validity_date);
// });

// // ==================== MIDDLEWARE ====================
// deliveryChallanSchema.pre('save', async function (next) {
//   for (const item of this.items) {
//     if (item.dispatch_qty && item.unit_price && !item.taxable_value) {
//       item.taxable_value = +(item.dispatch_qty * item.unit_price).toFixed(2);
//     }
//   }
//   next();
// });

// // ==================== STATIC METHODS ====================
// deliveryChallanSchema.statics.generateDCNumber = async function () {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, '0');
//   const prefix = `DC-${year}${month}`;

//   const lastDC = await this.findOne({ dc_number: new RegExp(`^${prefix}`) })
//     .sort({ dc_number: -1 });

//   let sequence = 1;
//   if (lastDC && lastDC.dc_number) {
//     const parts = lastDC.dc_number.split('-');
//     const lastSeq = parseInt(parts[2]);
//     if (!isNaN(lastSeq)) sequence = lastSeq + 1;
//   }

//   return `${prefix}-${String(sequence).padStart(4, '0')}`;
// };

// deliveryChallanSchema.statics.findOverduePOD = async function () {
//   const today = new Date();
//   return this.find({
//     status: 'Dispatched',
//     'pod.expected_delivery_date': { $lt: today },
//     'pod.pod_received': false
//   }).populate('customer_id', 'customer_name');
// };

// const DeliveryChallan = mongoose.model('DeliveryChallan', deliveryChallanSchema);
// module.exports = DeliveryChallan;





const mongoose = require('mongoose');

// Address Snapshot Schema
const addressSnapshotSchema = new mongoose.Schema({
  line1: { type: String, default: '' },
  line2: { type: String, default: '' },
  city: { type: String, default: '', required: false },
  district: { type: String, default: '', required: false },
  state: { type: String, default: '', required: false },
  state_code: { type: Number, default: 0, required: false },
  pincode: { type: String, default: '' },
  country: { type: String, default: 'India', required: false }
}, { _id: false });

// DC Item Schema — secondary_qty/unit/item_process_remark belong HERE (per item)
const dcItemSchema = new mongoose.Schema({
  so_item_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  part_no: { type: String, required: true, uppercase: true },
  part_name: { type: String, required: true },
  hsn_code: { type: String, required: false },
  dispatch_qty: { type: Number, required: true, min: 0.001 },
  unit: { type: String, enum: ['Nos', 'Kg', 'Meter', 'Set', 'Piece'], required: true },
  unit_price: { type: Number, default: 0 },
  taxable_value: { type: Number, default: 0 },
  batch_no: { type: String },
  serial_numbers: [{ type: String }],
  qc_passed: { type: Boolean, default: false },
  quality_cert_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QualityCertificate' },
  packing_list_line: { type: Number },
  remarks: { type: String },
  secondary_qty: { type: Number, default: 0 },
  secondary_unit: { type: String, default: '' },
  item_process_remark: { type: String, default: '' },
  // ADD THESE TWO FIELDS
  bom_weight_kg: { type: Number, default: 0 },  // System weight from BOM
  item_weight_kg: { type: Number, default: 0 }   // Standard weight from Item Master
});

// Transport Schema
const transportSchema = new mongoose.Schema({
  dispatch_through: { type: String, default: '' },
  dispatch_mode: {
    type: String,
    enum: ['', 'Road', 'Rail', 'Air', 'Sea', 'Hand Delivery', 'Courier'],
    default: ''
  },
  transporter_name: { type: String, default: '' },
  transporter_gstin: { type: String, default: '' },
  transporter_id_ewb: { type: String, default: '' },
  vehicle_no: { type: String, default: '' },
  vehicle_type: {
    type: String,
    enum: ['', 'Regular', 'Over Dimensional Cargo (ODC)', 'Water Vessel', 'Air Cargo'],
    default: ''
  },
  lr_number: { type: String, default: '' },
  lr_date: { type: Date },
  awb_number: { type: String, default: '' },
  courier_tracking_no: { type: String, default: '' },
  freight_terms: {
    type: String,
    enum: ['', 'Freight Paid', 'Freight To Pay', 'Freight Prepaid & Charged', 'Ex-Works'],
    default: ''
  },
  freight_amount: { type: Number, default: 0 },
  insurance_required: { type: Boolean, default: false },
  insurance_amount: { type: Number, default: 0 },
  insurance_policy_no: { type: String, default: '' }
});

// Packing Schema
const packingSchema = new mongoose.Schema({
  no_of_packages: { type: Number, default: 1, min: 1 },
  gross_weight_kg: { type: Number, default: 0 },
  net_weight_kg: { type: Number, default: 0 },
  packing_type: {
    type: String,
    enum: ['Cardboard Box', 'Wooden Crate', 'Pallet', 'Gunny Bag', 'Bare Bundle', 'Polybag', 'Drum', 'Tray'],
    default: 'Cardboard Box'
  },
  packing_details: { type: String, default: '' },
  dimension_l_mm: { type: Number, default: 0 },
  dimension_w_mm: { type: Number, default: 0 },
  dimension_h_mm: { type: Number, default: 0 },
  volumetric_weight_kg: { type: Number, default: 0 }
}, { _id: false });

// e-Way Bill Schema
const ewayBillSchema = new mongoose.Schema({
  eway_bill_required: { type: Boolean, default: false },
  eway_bill_number: { type: String },
  eway_bill_date: { type: Date },
  eway_bill_validity_date: { type: Date },
  eway_bill_generated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  eway_bill_mode: { type: String, enum: ['Portal', 'API', 'API (Mock)', 'Manual', 'Auto-Manual'] },
  eway_bill_status: {
    type: String,
    enum: ['Not Required', 'Pending', 'Generated', 'Extended', 'Cancelled', 'Verified'],
    default: 'Not Required'
  },
  eway_bill_cancel_reason: { type: String },
  eway_bill_part_b_updated: { type: Boolean, default: false },
  auto_generated: { type: Boolean, default: false },
  generation_reason: { type: String }
});

// POD Schema
const podSchema = new mongoose.Schema({
  expected_delivery_date: { type: Date },
  actual_delivery_date: { type: Date },
  pod_received: { type: Boolean, default: false },
  pod_date: { type: Date },
  pod_signed_by: { type: String },
  pod_file_path: { type: String },
  delivery_remarks: { type: String }
});

// Gate Pass Schema
const gatePassSchema = new mongoose.Schema({
  gate_pass_no: { type: String },
  gate_pass_time: { type: Date },
  security_officer: { type: String },
  dispatched_at: { type: Date },
  dispatch_confirmed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// REMOVED nature_of_processing from jobWorkSchema to avoid duplication
const jobWorkSchema = new mongoose.Schema({
  duration_of_process_days: { type: Number, default: 0, min: 0 },
  destination: { type: String, default: '' }
}, { _id: false });

// Challan Meta Schema
const challanMetaSchema = new mongoose.Schema({
  challan_series: { type: String, default: '' },
  reference_no: { type: String, default: '' },
  reference_date: { type: Date },
  buyer_order_no: { type: String, default: '' },
  buyer_order_date: { type: Date },
  dispatch_doc_no: { type: String, default: '' },
  other_references: { type: String, default: '' },
  payment_terms: { type: String, default: '30 Days' },
  company_email: { type: String, default: '' },
  company_pan: { type: String, default: '' }
}, { _id: false });

// ==================== MAIN SCHEMA ====================
const deliveryChallanSchema = new mongoose.Schema({
  dc_number: { type: String, unique: true },
  dc_date: { type: Date, default: Date.now, required: true },
  
  // nature_of_processing in main schema only (no duplication)
  nature_of_processing: {
    type: String,
    enum: [
      'Chamfer',
      'Zinc blue plating',
      'Yellow plating',
      'Brazing',
      'Dimple and forming',
      'Hardening',
      'Paint',
      'Phosphating',
      'Tapping',
      'Blackodising',
      'Machining',
      'Thin plating',
      'Silver Plating',
      'Not Specified'
    ],
    required: true,
    default: 'Not Specified'
  },

  // Links
  so_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder', required: false, index: true },
  so_number: { type: String, required: false },  
  customer_po_number: { type: String },
  invoice_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesInvoice' },

  // Seller (Consignor)
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  company_name: { type: String, required: true },
  company_gstin: { type: String, required: true },
  company_address: { type: addressSnapshotSchema, required: true },

  // Buyer (Consignee)
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customer_name: { type: String, required: true },
  customer_gstin: { type: String },
  ship_from: { type: addressSnapshotSchema, required: false },
  ship_to: { type: addressSnapshotSchema, required: false },
  billing_address: { type: addressSnapshotSchema },

  // GST Type
  gst_type: { type: String, enum: ['CGST/SGST', 'IGST'], default: 'CGST/SGST' },

  // Items
  items: [dcItemSchema],

  // Sub-documents
  transport: { type: transportSchema, default: () => ({}) },
  packing: { type: [packingSchema], default: () => [] },
  eway_bill: { type: ewayBillSchema, default: () => ({}) },
  gate_pass: { type: gatePassSchema, default: () => ({}) },
  pod: { type: podSchema, default: () => ({}) },

  // Job Work and Challan Meta
  job_work: { type: jobWorkSchema, default: () => ({}) },
  challan_meta: { type: challanMetaSchema, default: () => ({}) },

  // Status
  status: {
    type: String,
    enum: [
      'Planned', 'Packing In Progress', 'Packed', 'EWB Generated',
      'Dispatched', 'In Transit', 'Delivered', 'Partially Delivered',
      'Rejected by Customer', 'Returned', 'Cancelled'
    ],
    default: 'Planned',
    index: true
  },
  rejection_reason: { type: String },
  return_dc_id: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryChallan' },
  is_active: { type: Boolean, default: true },

  // Audit
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// ==================== INDEXES ====================
deliveryChallanSchema.index({ dc_number: 1 });
deliveryChallanSchema.index({ so_id: 1, status: 1 });
deliveryChallanSchema.index({ customer_id: 1, status: 1 });
deliveryChallanSchema.index({ 'pod.expected_delivery_date': 1, status: 1 });
deliveryChallanSchema.index({ createdAt: -1 });
deliveryChallanSchema.index({ 'eway_bill.eway_bill_number': 1 });

// ==================== VIRTUALS ====================
deliveryChallanSchema.virtual('total_value').get(function () {
  return this.items.reduce((sum, item) => sum + (item.taxable_value || 0), 0);
});
  
deliveryChallanSchema.virtual('total_quantity').get(function () {
  return this.items.reduce((sum, item) => sum + item.dispatch_qty, 0);
});

deliveryChallanSchema.virtual('is_ewaybill_overdue').get(function () {
  if (!this.eway_bill.eway_bill_validity_date) return false;
  if (this.status === 'Delivered') return false;
  return new Date() > new Date(this.eway_bill.eway_bill_validity_date);
});

// ==================== MIDDLEWARE ====================
deliveryChallanSchema.pre('save', async function (next) {
  for (const item of this.items) {
    if (item.dispatch_qty && item.unit_price && !item.taxable_value) {
      item.taxable_value = +(item.dispatch_qty * item.unit_price).toFixed(2);
    }
  }
  next();
});

// ==================== STATIC METHODS ====================
/**
 * Generate DC Number in format: SE/XXXX/YY-YY
 * Where XXXX is sequence number (resets every financial year)
 * YY-YY is financial year (e.g., 26-27, 27-28)
 */
deliveryChallanSchema.statics.generateDCNumber = async function () {
  const now = new Date();
  const month = now.getMonth() + 1; // January = 1
  
  // Calculate financial year (April to March)
  let startYear, endYear;
  if (month >= 4) {
    // April to December: financial year is current year to next year
    startYear = now.getFullYear();
    endYear = startYear + 1;
  } else {
    // January to March: financial year is previous year to current year
    startYear = now.getFullYear() - 1;
    endYear = startYear + 1;
  }
  
  const financialYear = `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
  const prefix = `SE`;
  const pattern = new RegExp(`^${prefix}/(\\d{4})/${financialYear}$`);
  
  // Find the last DC number for this financial year
  const lastDC = await this.findOne({ 
    dc_number: pattern 
  }).sort({ dc_number: -1 });
  
  let sequence = 1;
  if (lastDC && lastDC.dc_number) {
    const match = lastDC.dc_number.match(pattern);
    if (match && match[1]) {
      sequence = parseInt(match[1]) + 1;
    }
  }
  
  // Ensure sequence doesn't exceed 9999
  if (sequence > 9999) {
    throw new Error('DC number sequence exceeded maximum limit (9999) for this financial year');
  }
  
  return `${prefix}/${String(sequence).padStart(4, '0')}/${financialYear}`;
};

deliveryChallanSchema.statics.findOverduePOD = async function () {
  const today = new Date();
  return this.find({
    status: 'Dispatched',
    'pod.expected_delivery_date': { $lt: today },
    'pod.pod_received': false
  }).populate('customer_id', 'customer_name');
};

const DeliveryChallan = mongoose.model('DeliveryChallan', deliveryChallanSchema);
module.exports = DeliveryChallan;