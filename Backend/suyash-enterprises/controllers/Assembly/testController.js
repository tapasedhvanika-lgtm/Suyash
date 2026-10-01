'use strict';
const FunctionalTestRecord = require('../../models/Assembly/FunctionalTestRecord');
const { WorkOrder } = require('../../models/Production/WorkOrder');
const mongoose = require('mongoose');
// ======================================================
// CREATE FUNCTIONAL TEST RECORD
// ======================================================
exports.createFunctionalTest = async (req, res) => {
  try {
    const testData = req.body;
    
    // Validate required fields
    if (!testData.wo_id || !testData.test_type || !testData.test_parameter || 
        !testData.specified_value || !testData.tested_by || !testData.results) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: wo_id, test_type, test_parameter, specified_value, tested_by, results' 
      });
    }
    
    const workOrder = await WorkOrder.findById(testData.wo_id);
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }
    
    let passedCount = 0, failedCount = 0;
    const processedResults = testData.results.map(result => {
      if (result.pass_fail === 'Pass') passedCount++;
      else failedCount++;
      return {
        serial_no: result.serial_no,
        actual_value: result.actual_value,
        pass_fail: result.pass_fail,
        remarks: result.remarks || '',
        retest_count: result.retest_count || 0,
        tested_at: result.tested_at || new Date()
      };
    });
    
    let overallResult = 'Passed';
    if (failedCount > 0 && passedCount > 0) overallResult = 'Partially Passed';
    else if (failedCount > 0) overallResult = 'Failed';
    
    const testRecord = new FunctionalTestRecord({
      wo_id: testData.wo_id,
      wo_number: workOrder.wo_number,
      test_date: testData.test_date || new Date(),
      test_type: testData.test_type,
      test_standard: testData.test_standard,
      test_equipment_id: testData.test_equipment_id,
      test_equipment_name: testData.test_equipment_name,
      test_equipment_calibration_valid: testData.test_equipment_calibration_valid !== false,
      test_parameter: testData.test_parameter,
      specified_value: testData.specified_value,
      tested_by: testData.tested_by,
      tested_by_name: testData.tested_by_name || '',
      witness_id: testData.witness_id,
      witness_name: testData.witness_name || '',
      results: processedResults,
      test_report_path: testData.test_report_path,
      ncr_id: testData.ncr_id,
      overall_result: overallResult,
      passed_count: passedCount,
      failed_count: failedCount,
      remarks: testData.remarks,
      created_by: req.user._id
    });
    
    await testRecord.save();
    
    // If test failed, update work order status
    if (overallResult === 'Failed') {
      await WorkOrder.findByIdAndUpdate(testData.wo_id, {
        status: 'On Hold',
        hold_reason: `Failed functional test: ${testData.test_type} - ${testData.test_parameter}`
      });
    }
    
    res.status(201).json({ 
      success: true, 
      data: { 
        test_record_id: testRecord.test_record_id, 
        overall_result: overallResult,
        passed_count: passedCount,
        failed_count: failedCount
      } 
    });
  } catch (error) {
    console.error('Create functional test error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET FUNCTIONAL TESTS BY WORK ORDER
// ======================================================
exports.getFunctionalTestsByWorkOrder = async (req, res) => {
  try {
    const { wo_id } = req.params;
    const { test_type, overall_result, from_date, to_date } = req.query;
    
    const filter = { wo_id };
    if (test_type) filter.test_type = test_type;
    if (overall_result) filter.overall_result = overall_result;
    if (from_date || to_date) {
      filter.test_date = {};
      if (from_date) filter.test_date.$gte = new Date(from_date);
      if (to_date) filter.test_date.$lte = new Date(to_date);
    }
    
    const tests = await FunctionalTestRecord.find(filter)
      .populate('tested_by', 'FirstName LastName EmployeeID')
      .populate('witness_id', 'FirstName LastName EmployeeID')
      .sort({ test_date: -1 });
    
    const summary = {
      total_tests: tests.length,
      passed: tests.filter(t => t.overall_result === 'Passed').length,
      failed: tests.filter(t => t.overall_result === 'Failed').length,
      partially_passed: tests.filter(t => t.overall_result === 'Partially Passed').length,
      pass_rate: tests.length > 0 ? 
        ((tests.filter(t => t.overall_result === 'Passed').length / tests.length) * 100).toFixed(2) : 0
    };
    
    res.json({ success: true, data: { summary, tests } });
  } catch (error) {
    console.error('Get functional tests error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET TEST SUMMARY BY TYPE
// ======================================================
exports.getTestSummaryByType = async (req, res) => {
  try {
    const { wo_id } = req.params;
    
    const summary = await FunctionalTestRecord.aggregate([
      { $match: { wo_id: new mongoose.Types.ObjectId(wo_id) } },
      { $group: {
        _id: '$test_type',
        total_tests: { $sum: 1 },
        passed: { $sum: { $cond: [{ $eq: ['$overall_result', 'Passed'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$overall_result', 'Failed'] }, 1, 0] } },
        partially_passed: { $sum: { $cond: [{ $eq: ['$overall_result', 'Partially Passed'] }, 1, 0] } }
      }}
    ]);
    
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Get test summary error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};