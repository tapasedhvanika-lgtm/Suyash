

// const FinishedGood = require('../../models/Inventory/FinishedGood');
// const Item = require('../../models/CRM/Item');
// const nextRef = require('../../utils/nextRef');
// const RMPurchase = require('../../models/Inventory/RMPurchase');

// const recalculateStock = async (productName) => {
//   if (!productName) return;

 
//   const purchase = await RMPurchase.findOne({ 
//     name: { $regex: new RegExp(`^${productName.trim()}$`, 'i') } 
//   });
  
//   if (!purchase) {
//     console.log(`❌ [NOT FOUND] ${productName} Purchase table me nahi mila`);
//     return;
//   }

  
//   const allFGs = await FinishedGood.find({ 
//     name: { $regex: new RegExp(`^${productName.trim()}$`, 'i') } 
//   });
  
  
//   let totalUsed = 0;
//   allFGs.forEach(fg => {
//     totalUsed += Number(fg.quantity_produced || fg.qty || fg.quantity || 0);
//   });

//   const newRemaining = Math.max(0, purchase.quantity - totalUsed);

  
//   await RMPurchase.findByIdAndUpdate(purchase._id, {
//     used_qty: totalUsed,
//     remaining_qty: newRemaining
//   });

//   console.log(`✅ [RECALCULATED] ${purchase.name} | Total Used: ${totalUsed} | New Remaining: ${newRemaining}`);
// };


// const createFinishedGood = async (req, res) => {
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
//     const doc = new FinishedGood({ ...fields, created_by: req.user._id });
//     doc.ref_no = await nextRef('FG');
//     await doc.save();
    
   
//     await recalculateStock(doc.name);
    
//     return res.status(201).json({ success: true, message: 'Saved', data: doc });
//   } catch (error) {
//     return res.status(400).json({ success: false, message: error.message });
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
//     const oldDoc = await FinishedGood.findById(req.params.id);
//     if (!oldDoc) return res.status(404).json({ success: false, message: 'Not found' });

//     const doc = await FinishedGood.findByIdAndUpdate(req.params.id, fields, { new: true });
    
    
//     if (doc) {
//       await recalculateStock(doc.name);
      
//       if (oldDoc.name && oldDoc.name.toLowerCase() !== doc.name.toLowerCase()) {
//         await recalculateStock(oldDoc.name);
//       }
//     }
    
//     return res.json({ success: true, message: 'Updated', data: doc });
//   } catch (error) {
//     return res.status(400).json({ success: false, message: error.message });
//   }
// };

// // DELETE
// const deleteFinishedGood = async (req, res) => {
//   try {
//     const doc = await FinishedGood.findById(req.params.id);
//     if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    
//     await FinishedGood.findByIdAndDelete(req.params.id);
    
    
//     await recalculateStock(doc.name);
    
//     return res.json({ success: true, message: 'Deleted' });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // LIST & GET ONE
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
//       FinishedGood.find(filter).sort({ fg_date: -1, createdAt: -1 }).skip((pageNum - 1) * lim).limit(lim).lean(),
//       FinishedGood.countDocuments(filter)
//     ]);
//     return res.json({ success: true, data, pagination: { page: pageNum, limit: lim, total, pages: Math.ceil(total / lim) } });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// const getFinishedGood = async (req, res) => {
//   try {
//     const doc = await FinishedGood.findById(req.params.id).lean();
//     if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
//     return res.json({ success: true, data: doc });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// module.exports = { createFinishedGood, listFinishedGoods, getFinishedGood, updateFinishedGood, deleteFinishedGood };

const FinishedGood = require('../../models/Inventory/FinishedGood');
const Item = require('../../models/CRM/Item');
const nextRef = require('../../utils/nextRef');
const RMPurchase = require('../../models/Inventory/RMPurchase');

const recalculateAllStockFIFO = async () => {
  try {
    console.log("\n>>> Recalculating Stock (Global FIFO)...");

    // 1. Saare purchases ko reset karo (used_qty = 0, remaining_qty = quantity)
    const allPurchases = await RMPurchase.find();
    for (let p of allPurchases) {
      await RMPurchase.findByIdAndUpdate(p._id, { 
        used_qty: 0, 
        remaining_qty: p.quantity 
      });
    }

    const allFGs = await FinishedGood.find().sort({ createdAt: 1 });

   
    const usageMap = {};
    for (let fg of allFGs) {
      const name = fg.name.trim().toLowerCase();
      const qty = Number(fg.quantity_produced || fg.qty || fg.quantity || 0);
      if (!usageMap[name]) usageMap[name] = 0;
      usageMap[name] += qty;
    }

    for (let [name, totalUsed] of Object.entries(usageMap)) {
      if (totalUsed <= 0) continue;

     
      const purchases = await RMPurchase.find({
        name: { $regex: new RegExp(`^${name}$`, 'i') }
      }).sort({ purchase_date: 1, createdAt: 1 });

      let remainingToDeduct = totalUsed;

      for (let p of purchases) {
        if (remainingToDeduct <= 0) break;

        const deductAmount = Math.min(p.quantity, remainingToDeduct);
        const newUsed = deductAmount;
        const newRemaining = p.quantity - deductAmount;

        await RMPurchase.findByIdAndUpdate(p._id, {
          used_qty: newUsed,
          remaining_qty: newRemaining
        });

        remainingToDeduct -= deductAmount;
        console.log(`✅ Deducted ${deductAmount} from ${p.name} (Ref: ${p.ref_no}, Qty: ${p.quantity}) => Remaining: ${newRemaining}`);
      }
      
      if (remainingToDeduct > 0) {
        console.log(`⚠️ Warning: Could not find enough stock for ${name}. Still need: ${remainingToDeduct}`);
      }
    }
    console.log(">>> Recalculation Complete!\n");
  } catch (err) {
    console.error("Recalculation Error:", err);
  }
};

// CREATE
const createFinishedGood = async (req, res) => {
  try {
    const fields = { ...req.body };
    if (fields.product_type === 'Existing' && fields.item_id) {
      const item = await Item.findById(fields.item_id);
      if (item) {
        fields.name = item.part_name;
        fields.code = item.part_no;
        fields.unit = item.unit || 'Nos';
      }
    }
    const doc = new FinishedGood({ ...fields, created_by: req.user._id });
    doc.ref_no = await nextRef('FG');
    await doc.save();
    
   
    await recalculateAllStockFIFO(); 
    
    return res.status(201).json({ success: true, message: 'Finished Good saved', data: doc });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};


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
    }
    
    const doc = await FinishedGood.findByIdAndUpdate(req.params.id, fields, { new: true });
    
    
    await recalculateAllStockFIFO(); 
    
    return res.json({ success: true, message: 'Entry updated', data: doc });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteFinishedGood = async (req, res) => {
  try {
    const doc = await FinishedGood.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Entry not found' });
    
    
    await recalculateAllStockFIFO(); 
    
    return res.json({ success: true, message: 'Entry deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


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


const getFinishedGood = async (req, res) => {
  try {
    const doc = await FinishedGood.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Entry not found' });
    return res.json({ success: true, data: doc });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createFinishedGood, listFinishedGoods, getFinishedGood, updateFinishedGood, deleteFinishedGood };