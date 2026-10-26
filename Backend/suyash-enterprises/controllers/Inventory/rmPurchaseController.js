// // controllers/Inventory/rmPurchaseController.js
// const mongoose = require('mongoose');
// const RMPurchase = require('../../models/Inventory/RMPurchase');
// const Item = require('../../models/CRM/Item');
// const nextRef = require('../../utils/nextRef');

// const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
// const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// async function buildFields(body) {
//   const fields = {
//     purchase_date: body.purchase_date || new Date(),
//     rm_type: body.rm_type,
//     quantity: body.quantity,
//     party_name: body.party_name,
//     invoice_no: body.invoice_no
//   };

//   if (body.rm_type === 'Existing') {
//     if (!isValidId(body.item_id)) {
//       const err = new Error('Please select an existing raw material');
//       err.status = 400;
//       throw err;
//     }
//     const item = await Item.findById(body.item_id).select('part_no part_name unit is_active').lean();
//     if (!item) {
//       const err = new Error('Selected raw material not found in Item Master');
//       err.status = 404;
//       throw err;
//     }
//     fields.item_id = item._id;
//     fields.name = item.part_name;
//     fields.code = item.part_no;
//     fields.unit = item.unit;
//   } else {
//     fields.item_id = null;
//     fields.name = body.name;
//     fields.code = body.code;
//     if (body.unit) fields.unit = body.unit;
//   }
//   return fields;
// }

// // CREATE
// const createRMPurchase = async (req, res) => {
//   try {
//     const fields = await buildFields(req.body);
    
//     const doc = new RMPurchase({ 
//       ...fields, 
//       created_by: req.user._id,
//       used_qty: 0,
//       remaining_qty: fields.quantity 
//     });
    
//     await doc.validate();
//     doc.ref_no = await nextRef('RMP');
//     await doc.save();
//     return res.status(201).json({ success: true, message: 'Raw material purchase saved', data: doc });
//   } catch (error) {
//     if (error.name === 'ValidationError') {
//       const message = Object.values(error.errors).map((e) => e.message).join(', ');
//       return res.status(400).json({ success: false, message });
//     }
//     if (!error.status) console.error('[RMPurchase] create:', error);
//     return res.status(error.status || 500).json({ success: false, message: error.message });
//   }
// };

// // LIST
// const listRMPurchases = async (req, res) => {
//   try {
//     const { page = 1, limit = 20, search, rm_type, from_date, to_date } = req.query;
//     const filter = {};

//     if (rm_type) filter.rm_type = rm_type;
//     if (search) {
//       const rx = new RegExp(escapeRegex(search), 'i');
//       filter.$or = [{ ref_no: rx }, { name: rx }, { code: rx }, { party_name: rx }, { invoice_no: rx }];
//     }
//     if (from_date || to_date) {
//       filter.purchase_date = {};
//       if (from_date) filter.purchase_date.$gte = new Date(from_date);
//       if (to_date) {
//         const end = new Date(to_date);
//         end.setHours(23, 59, 59, 999);
//         filter.purchase_date.$lte = end;
//       }
//     }

//     const pageNum = Math.max(parseInt(page) || 1, 1);
//     const lim = Math.min(Math.max(parseInt(limit) || 20, 1), 200);

//     const [rawData, total] = await Promise.all([
//       RMPurchase.find(filter).sort({ purchase_date: -1, createdAt: -1 }).skip((pageNum - 1) * lim).limit(lim).lean(),
//       RMPurchase.countDocuments(filter)
//     ]);

   
//     const data = rawData.map(p => {
//       const rem = (p.remaining_qty === 0 && p.used_qty === 0) ? p.quantity : p.remaining_qty;
//       return { ...p, remaining_qty: rem };
//     });

//     return res.json({
//       success: true,
//       data,
//       pagination: { page: pageNum, limit: lim, total, pages: Math.ceil(total / lim) }
//     });
//   } catch (error) {
//     console.error('[RMPurchase] list:', error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // GET ONE
// const getRMPurchase = async (req, res) => {
//   try {
//     if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id' });
//     const doc = await RMPurchase.findById(req.params.id).lean();
//     if (!doc) return res.status(404).json({ success: false, message: 'Purchase entry not found' });
//     return res.json({ success: true, data: doc });
//   } catch (error) {
//     console.error('[RMPurchase] get:', error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // UPDATE
// const updateRMPurchase = async (req, res) => {
//   try {
//     if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id' });
//     const doc = await RMPurchase.findById(req.params.id);
//     if (!doc) return res.status(404).json({ success: false, message: 'Purchase entry not found' });

//     const fields = await buildFields({ ...doc.toObject(), ...req.body });
//     doc.set({ ...fields, updated_by: req.user._id });
    
//     // 👇 FIX: Agar edit karte waqt quantity badal jaye, to remaining adjust ho 👇
//     if (fields.quantity !== doc.quantity) {
//        const diff = fields.quantity - doc.quantity;
//        doc.remaining_qty = Math.max(0, (doc.remaining_qty || 0) + diff);
//     }
    
//     await doc.save();

//     return res.json({ success: true, message: 'Purchase entry updated', data: doc });
//   } catch (error) {
//     if (error.name === 'ValidationError') {
//       const message = Object.values(error.errors).map((e) => e.message).join(', ');
//       return res.status(400).json({ success: false, message });
//     }
//     if (!error.status) console.error('[RMPurchase] update:', error);
//     return res.status(error.status || 500).json({ success: false, message: error.message });
//   }
// };

// // DELETE
// const deleteRMPurchase = async (req, res) => {
//   try {
//     if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id' });
//     const doc = await RMPurchase.findByIdAndDelete(req.params.id);
//     if (!doc) return res.status(404).json({ success: false, message: 'Purchase entry not found' });
//     return res.json({ success: true, message: 'Purchase entry deleted' });
//   } catch (error) {
//     console.error('[RMPurchase] delete:', error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// module.exports = { createRMPurchase, listRMPurchases, getRMPurchase, updateRMPurchase, deleteRMPurchase };

// controllers/Inventory/rmPurchaseController.js
// controllers/Inventory/rmPurchaseController.js
const mongoose = require('mongoose');
const RMPurchase = require('../../models/Inventory/RMPurchase');
const Item = require('../../models/CRM/Item');
const nextRef = require('../../utils/nextRef');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function buildFields(body) {
  const fields = {
    purchase_date: body.purchase_date || new Date(),
    rm_type: body.rm_type,
    quantity: body.quantity,
    party_name: body.party_name,
    invoice_no: body.invoice_no
  };

  if (body.rm_type === 'Existing') {
    if (!isValidId(body.item_id)) {
      const err = new Error('Please select an existing raw material');
      err.status = 400;
      throw err;
    }
    const item = await Item.findById(body.item_id).select('part_no part_name unit is_active').lean();
    if (!item) {
      const err = new Error('Selected raw material not found in Item Master');
      err.status = 404;
      throw err;
    }
    fields.item_id = item._id;
    fields.name = item.part_name;
    fields.code = item.part_no;
    fields.unit = item.unit;
  } else {
    fields.item_id = null;
    fields.name = body.name;
    fields.code = body.code;
    if (body.unit) fields.unit = body.unit;
  }
  return fields;
}

// CREATE (Multiple Items Support)
const createRMPurchase = async (req, res) => {
  try {
    const { items, purchase_date, party_name, invoice_no } = req.body;

    // Check if items array is present
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one material item is required' });
    }

    const savedDocs = [];

    // 👇 FIX: Ref No loop ke BAHAR generate hoga, taaki sabhi items ka same Ref No rahe 👇
    const sharedRefNo = await nextRef('RMP');

    // Loop through all items (Copper, Aluminium, etc.)
    for (const item of items) {
      // Combine common fields with the specific item fields
      const mergedBody = {
        ...item,
        purchase_date,
        party_name,
        invoice_no
      };

      const fields = await buildFields(mergedBody);
      
      const doc = new RMPurchase({ 
        ...fields, 
        created_by: req.user._id,
        used_qty: 0,
        remaining_qty: fields.quantity 
      });
      
      await doc.validate();
      
      // 👇 Yahan sharedRefNo assign ho raha hai 👇
      doc.ref_no = sharedRefNo; 
      await doc.save();
      
      savedDocs.push(doc);
    }

    return res.status(201).json({ 
      success: true, 
      message: `${savedDocs.length} item(s) saved successfully under Ref ${sharedRefNo}`, 
      data: savedDocs 
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, message });
    }
    if (!error.status) console.error('[RMPurchase] create:', error);
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

// LIST
const listRMPurchases = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, rm_type, from_date, to_date } = req.query;
    const filter = {};

    if (rm_type) filter.rm_type = rm_type;
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ ref_no: rx }, { name: rx }, { code: rx }, { party_name: rx }, { invoice_no: rx }];
    }
    if (from_date || to_date) {
      filter.purchase_date = {};
      if (from_date) filter.purchase_date.$gte = new Date(from_date);
      if (to_date) {
        const end = new Date(to_date);
        end.setHours(23, 59, 59, 999);
        filter.purchase_date.$lte = end;
      }
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const lim = Math.min(Math.max(parseInt(limit) || 20, 1), 200);

    const [rawData, total] = await Promise.all([
      RMPurchase.find(filter).sort({ purchase_date: -1, createdAt: -1 }).skip((pageNum - 1) * lim).limit(lim).lean(),
      RMPurchase.countDocuments(filter)
    ]);

    // Fix for legacy data where remaining_qty is 0 but not used
    const data = rawData.map(p => {
      const rem = (p.remaining_qty === 0 && p.used_qty === 0) ? p.quantity : p.remaining_qty;
      return { ...p, remaining_qty: rem };
    });

    return res.json({
      success: true,
      data,
      pagination: { page: pageNum, limit: lim, total, pages: Math.ceil(total / lim) }
    });
  } catch (error) {
    console.error('[RMPurchase] list:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET ONE
const getRMPurchase = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id' });
    const doc = await RMPurchase.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Purchase entry not found' });
    return res.json({ success: true, data: doc });
  } catch (error) {
    console.error('[RMPurchase] get:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE (Single item edit)
const updateRMPurchase = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id' });
    const doc = await RMPurchase.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Purchase entry not found' });

    const fields = await buildFields({ ...doc.toObject(), ...req.body });
    doc.set({ ...fields, updated_by: req.user._id });
    
    // Adjust remaining quantity if quantity is changed
    if (fields.quantity !== doc.quantity) {
       const diff = fields.quantity - doc.quantity;
       doc.remaining_qty = Math.max(0, (doc.remaining_qty || 0) + diff);
    }
    
    await doc.save();

    return res.json({ success: true, message: 'Purchase entry updated', data: doc });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, message });
    }
    if (!error.status) console.error('[RMPurchase] update:', error);
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

// DELETE
const deleteRMPurchase = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id' });
    const doc = await RMPurchase.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Purchase entry not found' });
    return res.json({ success: true, message: 'Purchase entry deleted' });
  } catch (error) {
    console.error('[RMPurchase] delete:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createRMPurchase, listRMPurchases, getRMPurchase, updateRMPurchase, deleteRMPurchase };