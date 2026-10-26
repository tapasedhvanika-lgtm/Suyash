// const MaterialIssueSlip = require('../../models/Inventory/MaterialIssueSlip');
// const nextRef = require('../../utils/nextRef');

// // CREATE
// const createMaterialIssueSlip = async (req, res) => {
//   try {
//     const doc = new MaterialIssueSlip({
//       ...req.body,
//       created_by: req.user._id
//     });
    
//     // Auto generate Ref No: MIS-YYYYMM-XXXX
//     doc.ref_no = await nextRef('MIS');
//     await doc.save();

//     return res.status(201).json({ success: true, message: 'Material Issue Slip saved', data: doc });
//   } catch (error) {
//     if (error.name === 'ValidationError') {
//       const message = Object.values(error.errors).map((e) => e.message).join(', ');
//       return res.status(400).json({ success: false, message });
//     }
//     console.error('[MaterialIssueSlip] create:', error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // LIST
// const listMaterialIssueSlips = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, search } = req.query;
//     const filter = {};

//     if (search) {
//       const rx = new RegExp(search, 'i');
//       filter.$or = [{ ref_no: rx }, { department: rx }, { rmp_ref_no: rx }];
//     }

//     const pageNum = Math.max(parseInt(page) || 1, 1);
//     const lim = Math.min(Math.max(parseInt(limit) || 20, 1), 200);

//     const [data, total] = await Promise.all([
//       MaterialIssueSlip.find(filter).sort({ issue_date: -1 }).skip((pageNum - 1) * lim).limit(lim).lean(),
//       MaterialIssueSlip.countDocuments(filter)
//     ]);

//     return res.json({
//       success: true,
//       data,
//       pagination: { page: pageNum, limit: lim, total, pages: Math.ceil(total / lim) }
//     });
//   } catch (error) {
//     console.error('[MaterialIssueSlip] list:', error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // GET ONE
// const getMaterialIssueSlip = async (req, res) => {
//   try {
//     const doc = await MaterialIssueSlip.findById(req.params.id).lean();
//     if (!doc) return res.status(404).json({ success: false, message: 'Slip not found' });
//     return res.json({ success: true, data: doc });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// module.exports = { createMaterialIssueSlip, listMaterialIssueSlips, getMaterialIssueSlip };

const MaterialIssueSlip = require('../../models/Inventory/MaterialIssueSlip'); 
const nextRef = require('../../utils/nextRef');

// CREATE
const createMaterialIssueSlip = async (req, res) => {
  try {
    let bodyData = { ...req.body };

    if (bodyData.items && bodyData.items.length > 0) {
      const firstItem = bodyData.items[0];
      bodyData.name = bodyData.name || firstItem.name;
      bodyData.code = bodyData.code || firstItem.code;
      bodyData.quantity = bodyData.quantity || firstItem.quantity;
      bodyData.unit = bodyData.unit || firstItem.unit;
    }

    bodyData.purchase_id = bodyData.purchase_id || bodyData.rmp_id;
    bodyData.purchase_ref = bodyData.purchase_ref || bodyData.rmp_ref_no;
    delete bodyData.items;

    const doc = new MaterialIssueSlip({
      ...bodyData,
      created_by: req.user._id
    });
    
    doc.ref_no = await nextRef('MIS');
    await doc.save();

    return res.status(201).json({ success: true, message: 'Material Issue Slip saved', data: doc });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, message });
    }
    console.error('[MaterialIssueSlip] create:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// LIST
const listMaterialIssueSlips = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const filter = {};

    if (search) {
      const rx = new RegExp(search, 'i');
      filter.$or = [{ ref_no: rx }, { department: rx }, { purchase_ref: rx }];
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const lim = Math.min(Math.max(parseInt(limit) || 20, 1), 200);

    const [data, total] = await Promise.all([
      MaterialIssueSlip.find(filter).sort({ issue_date: -1 }).skip((pageNum - 1) * lim).limit(lim).lean(),
      MaterialIssueSlip.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      data,
      pagination: { page: pageNum, limit: lim, total, pages: Math.ceil(total / lim) }
    });
  } catch (error) {
    console.error('[MaterialIssueSlip] list:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET ONE
const getMaterialIssueSlip = async (req, res) => {
  try {
    const doc = await MaterialIssueSlip.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Slip not found' });
    return res.json({ success: true, data: doc });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createMaterialIssueSlip, listMaterialIssueSlips, getMaterialIssueSlip };