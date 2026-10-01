//reworkController.js

'use strict';
const { WorkOrder } = require('../../models/Production/WorkOrder');

exports.createReworkJob = async (req, res) => {
  try {
    const { wo_id } = req.params;
    const { failed_serial_numbers, failure_reason, rework_action } = req.body;
    
    const workOrder = await AssemblyWorkOrder.findById(wo_id);
    if (!workOrder) return res.status(404).json({ success: false, error: 'Work Order not found' });
    
    workOrder.status = 'On Hold';
    workOrder.hold_reason = `Rework required: ${failure_reason}`;
    await workOrder.save();
    
    res.status(201).json({ success: true, data: { rework_job_id: `RW-${Date.now()}`, failed_units: failed_serial_numbers, rework_action } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSubAssemblyRegister = async (req, res) => {
  try {
    const SubAssemblyRegister = require('../../models/Assembly/SubAssemblyRegister');
    const dependencies = await SubAssemblyRegister.find().populate('parent_wo_id', 'wo_number');
    res.json({ success: true, data: dependencies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};