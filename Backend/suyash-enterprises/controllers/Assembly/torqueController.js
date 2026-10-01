'use strict';
const mongoose = require('mongoose');
const TorqueRecord = require('../../models/Assembly/TorqueRecord');
const { WorkOrder } = require('../../models/Production/WorkOrder');

// ======================================================
// RECORD TORQUE APPLICATION
// ======================================================
exports.recordTorque = async (req, res) => {
  try {
    const torqueData = req.body;
    
    // Validate required fields
    if (!torqueData.wo_id || !torqueData.op_sequence || !torqueData.joint_reference ||
        !torqueData.specified_torque_nm || !torqueData.actual_torque_nm ||
        !torqueData.torque_tool_id || !torqueData.applied_by) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: wo_id, op_sequence, joint_reference, specified_torque_nm, actual_torque_nm, torque_tool_id, applied_by' 
      });
    }
    
    // Get work order
    const workOrder = await WorkOrder.findById(torqueData.wo_id);
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }
    
    // Get operation details
    const operation = workOrder.operations?.find(op => op.op_sequence === torqueData.op_sequence);
    
    // Calculate min/max (default ±10%)
    const torqueMin = torqueData.torque_min_nm || torqueData.specified_torque_nm * 0.9;
    const torqueMax = torqueData.torque_max_nm || torqueData.specified_torque_nm * 1.1;
    const withinSpec = torqueData.actual_torque_nm >= torqueMin && torqueData.actual_torque_nm <= torqueMax;
    
    const torqueRecord = new TorqueRecord({
      wo_id: torqueData.wo_id,
      wo_number: torqueData.wo_number || workOrder.wo_number,
      assembly_serial_no: torqueData.assembly_serial_no,
      assembly_seq_no: torqueData.assembly_seq_no,
      op_sequence: torqueData.op_sequence,
      operation_name: operation?.operation_name || torqueData.operation_name || '',
      joint_reference: torqueData.joint_reference,
      bolt_part_no: torqueData.bolt_part_no,
      bolt_size: torqueData.bolt_size,
      specified_torque_nm: torqueData.specified_torque_nm,
      torque_min_nm: torqueMin,
      torque_max_nm: torqueMax,
      actual_torque_nm: torqueData.actual_torque_nm,
      within_spec: withinSpec,
      torque_tool_id: torqueData.torque_tool_id,
      torque_tool_name: torqueData.torque_tool_name || '',
      applied_by: torqueData.applied_by,
      applied_by_name: torqueData.applied_by_name || '',
      applied_at: torqueData.applied_at || new Date(),
      pass_fail: withinSpec ? 'Pass' : 'Fail',
      failure_action: torqueData.failure_action || '',
      retry_count: torqueData.retry_count || 0,
      previous_attempt_torque: torqueData.previous_attempt_torque,
      verified_by: torqueData.verified_by,
      verified_at: torqueData.verified_at,
      remarks: torqueData.remarks || '',
      created_by: req.user._id
    });
    
    await torqueRecord.save();
    
    res.status(201).json({
      success: true,
      message: withinSpec ? 'Torque recorded - PASS' : 'Torque recorded - FAIL',
      data: {
        torque_record_id: torqueRecord.torque_record_id,
        within_spec: torqueRecord.within_spec,
        pass_fail: torqueRecord.pass_fail,
        actual_torque: torqueRecord.actual_torque_nm,
        specified_torque: torqueRecord.specified_torque_nm
      }
    });
  } catch (error) {
    console.error('Record torque error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET TORQUE RECORDS BY WORK ORDER
// ======================================================
exports.getTorqueRecordsByWorkOrder = async (req, res) => {
  try {
    const { wo_id } = req.params;
    const { assembly_serial_no, from_date, to_date, pass_fail } = req.query;
    
    const filter = { wo_id };
    if (assembly_serial_no) filter.assembly_serial_no = assembly_serial_no;
    if (pass_fail) filter.pass_fail = pass_fail;
    if (from_date || to_date) {
      filter.applied_at = {};
      if (from_date) filter.applied_at.$gte = new Date(from_date);
      if (to_date) filter.applied_at.$lte = new Date(to_date);
    }
    
    const records = await TorqueRecord.find(filter)
      .populate('applied_by', 'FirstName LastName EmployeeID')
      .populate('verified_by', 'FirstName LastName EmployeeID')
      .sort({ applied_at: -1 });
    
    const summary = {
      total_records: records.length,
      pass_count: records.filter(r => r.pass_fail === 'Pass').length,
      fail_count: records.filter(r => r.pass_fail === 'Fail').length,
      pass_rate: records.length > 0 ? 
        ((records.filter(r => r.pass_fail === 'Pass').length / records.length) * 100).toFixed(2) : 0
    };
    
    res.json({
      success: true,
      data: { summary, records }
    });
  } catch (error) {
    console.error('Get torque records error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET TORQUE SUMMARY BY JOINT
// ======================================================
exports.getTorqueSummaryByJoint = async (req, res) => {
  try {
    const { wo_id } = req.params;
    
    const summary = await TorqueRecord.aggregate([
      { $match: { wo_id: new mongoose.Types.ObjectId(wo_id) } },
      { $group: {
        _id: '$joint_reference',
        total_count: { $sum: 1 },
        pass_count: { $sum: { $cond: [{ $eq: ['$pass_fail', 'Pass'] }, 1, 0] } },
        fail_count: { $sum: { $cond: [{ $eq: ['$pass_fail', 'Fail'] }, 1, 0] } },
        avg_torque: { $avg: '$actual_torque_nm' },
        min_torque: { $min: '$actual_torque_nm' },
        max_torque: { $max: '$actual_torque_nm' }
      }}
    ]);
    
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Get torque summary error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};