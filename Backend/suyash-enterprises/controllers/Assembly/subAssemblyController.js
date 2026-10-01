'use strict';
const mongoose = require('mongoose');
const SubAssemblyRegister = require('../../models/Assembly/SubAssemblyRegister');
const { WorkOrder } = require('../../models/Production/WorkOrder');
const StockLedger = require('../../models/Inventory/StockLedger');

// ======================================================
// GET SUB-ASSEMBLY DEPENDENCIES FOR PARENT WO
// ======================================================
exports.getSubAssemblyDependencies = async (req, res) => {
  try {
    const { wo_id } = req.params;
    
    // Convert to ObjectId properly
    const parentObjectId = mongoose.Types.ObjectId(wo_id);
    
    const workOrder = await WorkOrder.findById(wo_id);
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }
    
    const dependencies = await SubAssemblyRegister.find({ parent_wo_id: parentObjectId })
      .populate('child_wo_id', 'wo_number status priority planned_end completed_qty');
    
    // Update available quantities from stock - FIXED: Convert child_item_id to ObjectId
    for (const dep of dependencies) {
      const childItemObjectId = mongoose.Types.ObjectId(dep.child_item_id);
      
      const stock = await StockLedger.aggregate([
        { $match: { item_id: childItemObjectId } },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]);
      
      dep.available_qty = stock[0]?.total || 0;
      dep.shortage_qty = Math.max(0, dep.required_qty - dep.available_qty);
      dep.dependency_met = dep.available_qty >= dep.required_qty;
      await dep.save();
    }
    
    const allMet = dependencies.every(d => d.dependency_met);
    
    res.json({
      success: true,
      data: {
        wo_number: workOrder.wo_number,
        wo_status: workOrder.status,
        all_dependencies_met: allMet,
        dependencies: dependencies,
        shortages: dependencies.filter(d => !d.dependency_met),
        total_shortage_items: dependencies.filter(d => !d.dependency_met).length
      }
    });
  } catch (error) {
    console.error('Get sub-assembly dependencies error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET ALL SUB-ASSEMBLY REGISTER
// ======================================================
exports.getSubAssemblyRegister = async (req, res) => {
  try {
    const { parent_wo_id, child_wo_id, dependency_met } = req.query;
    
    const filter = {};
    if (parent_wo_id) filter.parent_wo_id = mongoose.Types.ObjectId(parent_wo_id);
    if (child_wo_id) filter.child_wo_id = mongoose.Types.ObjectId(child_wo_id);
    if (dependency_met !== undefined) filter.dependency_met = dependency_met === 'true';
    
    const register = await SubAssemblyRegister.find(filter)
      .populate('parent_wo_id', 'wo_number part_no part_name status priority')
      .populate('child_wo_id', 'wo_number part_no status planned_end')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: register });
  } catch (error) {
    console.error('Get sub-assembly register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};