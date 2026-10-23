// const FinishedGood = require('../../models/Inventory/FinishedGood');
// const Item = require('../../models/CRM/Item');
// const nextRef = require('../../utils/nextRef');

// // CREATE
// const createFinishedGood = async (req, res) => {
//   try {
//     const fields = { ...req.body };
    
//     // Agar Existing select kiya hai, to Item Master se details uthayenge
//     if (fields.product_type === 'Existing' && fields.item_id) {
//       const item = await Item.findById(fields.item_id);
//       if (item) {
//         fields.name = item.part_name;
//         fields.code = item.part_no;
//         fields.unit = item.unit || 'Nos';
//       }
//     }

//     const doc = new FinishedGood({
//       ...fields,
//       created_by: req.user._id
//     });
    
//     // Auto generate Ref No: FG-YYYYMM-XXXX
//     doc.ref_no = await nextRef('FG');
//     await doc.save();

//     return res.status(201).json({ success: true, message: 'Finished Good saved', data: doc });
//   } catch (error) {
//     return res.status(400).json({ success: false, message: error.message });
//   }
// };

// // LIST
// const listFinishedGoods = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, search } = req.query;
//     const filter = {};

//     if (search) {
//       const rx = new RegExp(search, 'i');
//       filter.$or = [{ ref_no: rx }, { name: rx }, { code: rx }];
//     }

//     const pageNum = Math.max(parseInt(page) || 1, 1);
//     const lim = Math.min(Math.max(parseInt(limit) || 20, 1), 200);

//     const [data, total] = await Promise.all([
//       FinishedGood.find(filter).sort({ fg_date: -1 }).skip((pageNum - 1) * lim).limit(lim).lean(),
//       FinishedGood.countDocuments(filter)
//     ]);

//     return res.json({
//       success: true,
//       data,
//       pagination: { page: pageNum, limit: lim, total, pages: Math.ceil(total / lim) }
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // GET ONE
// const getFinishedGood = async (req, res) => {
//   try {
//     const doc = await FinishedGood.findById(req.params.id).lean();
//     if (!doc) return res.status(404).json({ success: false, message: 'Entry not found' });
//     return res.json({ success: true, data: doc });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // UPDATE
// const updateFinishedGood = async (req, res) => {
//   try {
//     const fields = { ...req.body };
    
//     if (fields.product_type === 'Existing' && fields.item_id) {
//       const item = await Item.findById(fields.item_id);
//       if (item) {
//         fields.name = item.part_name;
//         fields.code = item.part_no;
//         fields.unit = item.unit || 'Nos';
//       }
//     }

//     const doc = await FinishedGood.findByIdAndUpdate(req.params.id, fields, { new: true });
//     if (!doc) return res.status(404).json({ success: false, message: 'Entry not found' });
    
//     return res.json({ success: true, message: 'Entry updated', data: doc });
//   } catch (error) {
//     return res.status(400).json({ success: false, message: error.message });
//   }
// };

// // DELETE
// const deleteFinishedGood = async (req, res) => {
//   try {
//     const doc = await FinishedGood.findByIdAndDelete(req.params.id);
//     if (!doc) return res.status(404).json({ success: false, message: 'Entry not found' });
//     return res.json({ success: true, message: 'Entry deleted' });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// module.exports = { createFinishedGood, listFinishedGoods, getFinishedGood, updateFinishedGood, deleteFinishedGood };

const FinishedGood = require('../../models/Inventory/FinishedGood');
const Item = require('../../models/CRM/Item');
const nextRef = require('../../utils/nextRef');

// CREATE
const createFinishedGood = async (req, res) => {
  try {
    const fields = { ...req.body };
    
    // Agar Existing select kiya hai, to Item Master se details uthayenge
    if (fields.product_type === 'Existing' && fields.item_id) {
      const item = await Item.findById(fields.item_id);
      if (item) {
        fields.name = item.part_name;
        fields.code = item.part_no;
        fields.unit = item.unit || 'Nos';
      }
    } else {
      // 👇 YE NAYA LOGIC HAI (BSON Error fix) 👇
      // Agar New hai ya item_id nahi hai, to usko null set kar do
      fields.item_id = null; 
    }

    const doc = new FinishedGood({
      ...fields,
      created_by: req.user._id
    });
    
    // Auto generate Ref No: FG-YYYYMM-XXXX
    doc.ref_no = await nextRef('FG');
    await doc.save();

    return res.status(201).json({ success: true, message: 'Finished Good saved', data: doc });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// LIST
const listFinishedGoods = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const filter = {};

    if (search) {
      const rx = new RegExp(search, 'i');
      filter.$or = [{ ref_no: rx }, { name: rx }, { code: rx }];
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const lim = Math.min(Math.max(parseInt(limit) || 20, 1), 200);

    const [data, total] = await Promise.all([
      // 👇 SORTING FIX: Naya entry sabse upar dikhega 👇
      FinishedGood.find(filter).sort({ fg_date: -1, createdAt: -1 }).skip((pageNum - 1) * lim).limit(lim).lean(),
      FinishedGood.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      data,
      pagination: { page: pageNum, limit: lim, total, pages: Math.ceil(total / lim) }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET ONE
const getFinishedGood = async (req, res) => {
  try {
    const doc = await FinishedGood.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Entry not found' });
    return res.json({ success: true, data: doc });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE
const updateFinishedGood = async (req, res) => {
  try {
    const fields = { ...req.body };
    
    if (fields.product_type === 'Existing' && fields.item_id) {
      const item = await Item.findById(fields.item_id);
      if (item) {
        fields.name = item.part_name;
        fields.code = item.part_no;
        fields.unit = item.unit || 'Nos';
      }
    } else {
      // 👇 YE NAYA LOGIC HAI (BSON Error fix) 👇
      fields.item_id = null;
    }

    const doc = await FinishedGood.findByIdAndUpdate(req.params.id, fields, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Entry not found' });
    
    return res.json({ success: true, message: 'Entry updated', data: doc });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE
const deleteFinishedGood = async (req, res) => {
  try {
    const doc = await FinishedGood.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Entry not found' });
    return res.json({ success: true, message: 'Entry deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createFinishedGood, listFinishedGoods, getFinishedGood, updateFinishedGood, deleteFinishedGood };