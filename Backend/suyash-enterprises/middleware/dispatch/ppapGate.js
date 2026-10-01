// middleware/dispatch/ppapGate.js
const mongoose = require('mongoose');
const dispatchIntegration = require('../../services/Dispatch/dispatchIntegrationService');

exports.ppapGate = async (req, res, next) => {
  try {
    const { items, so_id } = req.body;
    
    if (!so_id || !items || items.length === 0) {
      return next();
    }
    
    const SalesOrder = mongoose.model('SalesOrder');
    let salesOrder;
    
    try {
      salesOrder = await SalesOrder.findById(so_id);
    } catch (err) {
      console.warn('SalesOrder model not available, skipping PPAP check');
      return next();
    }
    
    if (!salesOrder) {
      return next();
    }

    const Item = mongoose.model('Item');
    
    for (const item of items) {
      let itemMaster;
      try {
        itemMaster = await Item.findById(item.item_id);
      } catch (err) {
        continue;
      }
      
      if (itemMaster && itemMaster.is_ppap_required) {
        try {
          const ppapCheck = await dispatchIntegration.checkPPAPApproval(
            item.item_id,
            salesOrder.customer_id,
            req.headers.authorization
          );
          
          if (!ppapCheck.approved) {
            return res.status(400).json({ 
              error: `PPAP approval required for ${item.part_no} before dispatch to this customer`,
              item: item.part_no,
              customer: salesOrder.customer_name
            });
          }
        } catch (err) {
          console.warn('PPAP check failed:', err.message);
        }
      }
    }
    
    next();
  } catch (error) {
    console.warn('PPAP gate error:', error.message);
    next();
  }
};