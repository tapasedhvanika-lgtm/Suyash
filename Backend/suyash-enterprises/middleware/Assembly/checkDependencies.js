'use strict';
const SubAssemblyChecker = require('../../services/Assembly/subAssemblyChecker');

exports.checkDependencies = async (req, res, next) => {
  try {
    const { wo_id } = req.params;
    const depStatus = await SubAssemblyChecker.checkDependencies(wo_id);
    
    if (!depStatus.all_dependencies_met) {
      return res.status(400).json({
        success: false,
        error: 'Cannot proceed - sub-assembly dependencies not met',
        data: { shortages: depStatus.shortages }
      });
    }
    
    req.dependenciesMet = true;
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};