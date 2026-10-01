// // middleware/dispatch/validateDC.js
// const Joi = require('joi');
// const mongoose = require('mongoose');

// const dcItemSchema = Joi.object({
//   so_item_id: Joi.string().required(),
//   part_no: Joi.string().required(),
//   part_name: Joi.string().required(),
//   hsn_code: Joi.string().required(),
//   dispatch_qty: Joi.number().min(0.001).required(),
//   unit: Joi.string().valid('Nos', 'Kg', 'Meter', 'Set', 'Piece').required(),
//   unit_price: Joi.number().min(0).default(0),
//   batch_no: Joi.string().allow(''),
//   quality_cert_id: Joi.string()
// });

// const addressSchema = Joi.object({
//   line1: Joi.string().required(),
//   line2: Joi.string().allow(''),
//   city: Joi.string().required(),
//   district: Joi.string().allow(''),
//   state: Joi.string().required(),
//   state_code: Joi.number().required(),
//   pincode: Joi.string().required(),
//   country: Joi.string().default('India')
// });

// const createDCSchema = Joi.object({
//   so_id: Joi.string().required(),
//   dc_type: Joi.string().valid('Supply of Goods', 'Delivery for Approval', 'Job Work Outward', 'Sales Return', 'Exhibition', 'Export').required(),
//   ship_to: addressSchema.required(),
//   items: Joi.array().items(dcItemSchema).min(1).required()
// });

// exports.validateDC = async (req, res, next) => {
//   try {
//     const { error } = createDCSchema.validate(req.body);
//     if (error) {
//       return res.status(400).json({ error: error.details[0].message });
//     }

//     const DeliveryChallan = mongoose.model('DeliveryChallan');
//     const existingDC = await DeliveryChallan.findOne({
//       so_id: req.body.so_id,
//       status: { $in: ['Planned', 'Packing In Progress', 'Packed', 'Dispatched'] }
//     });

//     if (existingDC && req.body.items.some(item => 
//       existingDC.items.some(existing => existing.so_item_id === item.so_item_id)
//     )) {
//       return res.status(400).json({ error: 'A pending DC already exists for this SO item' });
//     }

//     next();
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// middleware/dispatch/validateDC.js
const Joi = require('joi');
const mongoose = require('mongoose');

const dcItemSchema = Joi.object({
  so_item_id: Joi.string().allow(''),  // ✅ Made optional for vendor DCs
  part_no: Joi.string().required(),
  part_name: Joi.string().required(),
  hsn_code: Joi.string().allow(''),  // ✅ Made optional
  dispatch_qty: Joi.number().min(0.001).required(),
  unit: Joi.string().valid('Nos', 'Kg', 'Meter', 'Set', 'Piece').required(),
  unit_price: Joi.number().min(0).default(0),
  taxable_value: Joi.number().default(0),
  batch_no: Joi.string().allow(''),
  quality_cert_id: Joi.string().allow(''),
  secondary_qty: Joi.number().default(0),
  secondary_unit: Joi.string().allow(''),
  item_process_remark: Joi.string().allow(''),
  weight_kg: Joi.number().min(0).default(0),  // ✅ For weight-based quantity
  // ✅ Weight fields (system populated)
  bom_weight_kg: Joi.number().default(0),
  item_weight_kg: Joi.number().default(0),
  weight_per_unit_kg: Joi.number().default(0)
});

const addressSchema = Joi.object({
  line1: Joi.string().allow(''),  // ✅ Made optional
  line2: Joi.string().allow(''),
  city: Joi.string().allow(''),  // ✅ Made optional
  district: Joi.string().allow(''),
  state: Joi.string().allow(''),  // ✅ Made optional
  state_code: Joi.number().allow(''),  // ✅ Made optional
  pincode: Joi.string().allow(''),  // ✅ NOW OPTIONAL (uncommented)
  country: Joi.string().default('India')
});

const transportSchema = Joi.object({
  dispatch_through: Joi.string().allow(''),
  dispatch_mode: Joi.string().valid('', 'Road', 'Rail', 'Air', 'Sea', 'Hand Delivery', 'Courier').default(''),
  transporter_name: Joi.string().allow(''),
  transporter_gstin: Joi.string().allow(''),
  transporter_id_ewb: Joi.string().allow(''),
  vehicle_no: Joi.string().allow(''),
  vehicle_type: Joi.string().valid('', 'Regular', 'Over Dimensional Cargo (ODC)', 'Water Vessel', 'Air Cargo').default(''),
  lr_number: Joi.string().allow(''),
  lr_date: Joi.date().allow(null),
  freight_terms: Joi.string().valid('', 'Freight Paid', 'Freight To Pay', 'Freight Prepaid & Charged', 'Ex-Works').default(''),
  freight_amount: Joi.number().min(0).default(0)
});

const packingSchema = Joi.object({
  no_of_packages: Joi.number().min(1).default(1),
  gross_weight_kg: Joi.number().min(0).default(0),
  net_weight_kg: Joi.number().min(0).default(0),
  packing_type: Joi.string().valid('Cardboard Box', 'Wooden Crate', 'Pallet', 'Gunny Bag', 'Bare Bundle', 'Polybag', 'Drum', 'Tray').default('Cardboard Box'),
  packing_details: Joi.string().allow(''),
  dimension_l_mm: Joi.number().default(0),
  dimension_w_mm: Joi.number().default(0),
  dimension_h_mm: Joi.number().default(0),
  volumetric_weight_kg: Joi.number().default(0)
});

const jobWorkSchema = Joi.object({
  nature_of_processing: Joi.string().valid(
    'Chamfer', 'Zinc blue plating', 'Yellow plating', 'Brazing',
    'Dimple and forming', 'Hardening', 'Paint', 'Phosphating',
    'Tapping', 'Blackodising', 'Machining', 'Thin plating',
    'Silver Plating', 'Not Specified'
  ).default('Not Specified'),
  duration_of_process_days: Joi.number().min(0).default(0),
  destination: Joi.string().allow('')
});

const challanMetaSchema = Joi.object({
  challan_series: Joi.string().allow(''),
  reference_no: Joi.string().allow(''),
  reference_date: Joi.date().allow(null),
  buyer_order_no: Joi.string().allow(''),
  buyer_order_date: Joi.date().allow(null),
  dispatch_doc_no: Joi.string().allow(''),
  other_references: Joi.string().allow(''),
  payment_terms: Joi.string().default('30 Days'),
  company_email: Joi.string().email().allow(''),
  company_pan: Joi.string().allow('')
});

const createDCSchema = Joi.object({
  // Either so_id OR vendor_id is required
  so_id: Joi.string().when('vendor_id', {
    is: Joi.exist(),
    then: Joi.string().allow(''),
    otherwise: Joi.string().required()
  }),
  vendor_id: Joi.string().when('so_id', {
    is: Joi.exist(),
    then: Joi.string().allow(''),
    otherwise: Joi.string().required()
  }),
  
  dc_type: Joi.string().valid(
    'Supply of Goods', 
    'Delivery for Approval', 
    'Job Work Outward', 
    'Sales Return', 
    'Exhibition', 
    'Export'
  ).default('Supply of Goods'),
  
  nature_of_processing: Joi.string().valid(
    'Chamfer', 'Zinc blue plating', 'Yellow plating', 'Brazing',
    'Dimple and forming', 'Hardening', 'Paint', 'Phosphating',
    'Tapping', 'Blackodising', 'Machining', 'Thin plating',
    'Silver Plating', 'Not Specified'
  ).default('Not Specified'),
  
  // ✅ Make ship_to optional
  ship_to: addressSchema.optional().default({}),
  billing_address: addressSchema.optional().default({}),
  
  items: Joi.array().items(dcItemSchema).min(1).required(),
  packing: Joi.array().items(packingSchema).optional().default([]),
  dispatch_through: Joi.string().allow('').optional(),
  transport: transportSchema.optional().default({}),
  job_work: jobWorkSchema.optional().default({}),
  challan_meta: challanMetaSchema.optional().default({}),
  dc_date: Joi.date().default(Date.now)
}).xor('so_id', 'vendor_id');

// ✅ Validation middleware
exports.validateDC = async (req, res, next) => {
  try {
    // Validate request body
    const { error } = createDCSchema.validate(req.body, { 
      abortEarly: false,
      allowUnknown: true  // ✅ Allow extra fields
    });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors 
      });
    }

    // ✅ Check for duplicate pending DCs
    const DeliveryChallan = mongoose.model('DeliveryChallan');
    
    // Different checks for SO-based vs Vendor-based DCs
    if (req.body.so_id) {
      // Check if there's already a pending DC for this SO
      const existingDC = await DeliveryChallan.findOne({
        so_id: req.body.so_id,
        status: { $in: ['Planned', 'Packing In Progress', 'Packed', 'Dispatched'] }
      });

      if (existingDC) {
        // Check if any items from this SO are already in a pending DC
        const duplicateItems = existingDC.items.filter(existingItem => 
          req.body.items.some(newItem => 
            newItem.so_item_id && existingItem.so_item_id.toString() === newItem.so_item_id
          )
        );

        if (duplicateItems.length > 0) {
          return res.status(400).json({ 
            error: 'Some items already have pending DCs',
            duplicate_items: duplicateItems.map(i => i.part_no)
          });
        }
      }
    } else if (req.body.vendor_id) {
      // For vendor DCs, check if there's a pending DC with same vendor and items
      // This is a looser check since vendor DCs don't have SO items
      const existingDC = await DeliveryChallan.findOne({
        customer_id: req.body.vendor_id,
        status: { $in: ['Planned', 'Packing In Progress', 'Packed'] }
      });

      if (existingDC) {
        // Check for duplicate items by part_no
        const duplicateParts = existingDC.items.filter(existingItem =>
          req.body.items.some(newItem => 
            newItem.part_no && existingItem.part_no === newItem.part_no.toUpperCase()
          )
        );

        if (duplicateParts.length > 0) {
          // This is a warning, not an error - vendors can have multiple DCs
          // Just log it but allow the creation
          console.warn('[Validation] Duplicate parts found in vendor DC:', duplicateParts.map(i => i.part_no));
        }
      }
    }

    next();
  } catch (error) {
    console.error('DC Validation error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Optional: Validate only items (for adding items to existing DC)
exports.validateItems = async (req, res, next) => {
  try {
    const itemsSchema = Joi.array().items(dcItemSchema).min(1).required();
    const { error } = itemsSchema.validate(req.body.items);
    
    if (error) {
      return res.status(400).json({ 
        error: 'Items validation failed',
        details: error.details[0].message 
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Optional: Validate EWB generation
exports.validateEWB = Joi.object({
  transporter_name: Joi.string().allow(''),
  transporter_id: Joi.string().allow(''),
  transporter_gstin: Joi.string().allow(''),
  vehicle_no: Joi.string().allow(''),
  dispatch_mode: Joi.string().valid('', 'Road', 'Rail', 'Air', 'Sea').default('Road'),
  freight_terms: Joi.string().valid('', 'Freight Paid', 'Freight To Pay').default('Freight Paid'),
  freight_amount: Joi.number().min(0).default(0),
  ewb_number: Joi.string().allow(''),  // For manual entry
  ewb_date: Joi.date().allow(null),
  validity_date: Joi.date().allow(null)
});