// const Purchase = require('../../models/Inventory/PurchaseRawMaterial');

// // 1. Create a new purchase entry
// exports.createPurchase = async (req, res) => {
//   try {
//     // Auto Reference generation (e.g., PUR-123456)
//     const autoRef = `PUR-${Date.now().toString().slice(-6)}`;
    
//     const newPurchase = await Purchase.create({
//       ...req.body,
//       refNumber: autoRef
//     });
//     res.status(201).json({ success: true, data: newPurchase });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // 2. Get all purchase entries (for the table)
// exports.getAllPurchases = async (req, res) => {
//   try {
//     const purchases = await Purchase.find().sort({ createdAt: -1 });
//     res.status(200).json({ success: true, data: purchases });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

const Purchase = require('../../models/Inventory/PurchaseRawMaterial');

exports.createPurchase = async (req, res) => {
  try {
    const autoRef = `PUR-${Date.now().toString().slice(-6)}`;
    const newPurchase = await Purchase.create({ ...req.body, refNumber: autoRef });
    res.status(201).json({ success: true, data: newPurchase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: purchases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ NAYA: Update Purchase
exports.updatePurchase = async (req, res) => {
  try {
    const updatedPurchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPurchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }
    res.status(200).json({ success: true, data: updatedPurchase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ NAYA: Delete Purchase
exports.deletePurchase = async (req, res) => {
  try {
    const deletedPurchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!deletedPurchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }
    res.status(200).json({ success: true, message: 'Purchase deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};