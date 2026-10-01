'use strict';

exports.validateTorqueTool = async (req, res, next) => {
  try {
    const { torque_tool_id, torque_tool_name } = req.body;
    
    if (!torque_tool_id && !torque_tool_name) {
      return res.status(400).json({ success: false, error: 'Torque tool ID or name is required' });
    }
    
    req.torqueTool = { id: torque_tool_id, name: torque_tool_name || torque_tool_id, calibration_valid: true };
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};