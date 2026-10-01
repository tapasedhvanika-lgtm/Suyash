// controllers/Dispatch/customerReturnController.js
const CustomerReturn = require('../../models/Dispatch/CustomerReturn');  // This should be correct

exports.initiateReturn = async (req, res) => {
  try {
    const customerReturn = new CustomerReturn({
      ...req.body,
      created_by: req.user._id
    });
    await customerReturn.save();
    res.status(201).json({ success: true, data: customerReturn });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.listReturns = async (req, res) => {
  try {
    const returns = await CustomerReturn.find().sort({ return_date: -1 });
    res.json({ success: true, data: returns });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.receiveReturn = async (req, res) => {
  try {
    const customerReturn = await CustomerReturn.findById(req.params.id);
    if (!customerReturn) return res.status(404).json({ error: 'Return not found' });
    customerReturn.status = 'Return in Transit';
    customerReturn.return_eway_bill_no = req.body.return_eway_bill_no;
    await customerReturn.save();
    res.json({ success: true, data: customerReturn });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.inspectReturn = async (req, res) => {
  try {
    const customerReturn = await CustomerReturn.findById(req.params.id);
    if (!customerReturn) return res.status(404).json({ error: 'Return not found' });
    customerReturn.inward_inspection_done = true;
    customerReturn.stock_disposition = req.body.stock_disposition;
    customerReturn.status = 'Inspected';
    customerReturn.processed_by = req.user._id;
    await customerReturn.save();
    res.json({ success: true, data: customerReturn });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};