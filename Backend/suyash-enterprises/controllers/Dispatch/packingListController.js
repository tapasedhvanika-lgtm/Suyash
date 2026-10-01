// controllers/Dispatch/packingListController.js
const PackingList = require('../../models/Dispatch/PackingList');
const DeliveryChallan = require('../../models/Dispatch/DeliveryChallan');

// ✅ NEW: List all packing lists with filters and pagination
exports.listPackingLists = async (req, res) => {
  try {
    const { dc_id, status, packed_by, from_date, to_date, page = 1, limit = 50 } = req.query;

    const query = {};
    if (dc_id) query.dc_id = dc_id;
    if (status) query.status = status;
    if (packed_by) query.packed_by = packed_by;
    if (from_date || to_date) {
      query.pl_date = {};
      if (from_date) query.pl_date.$gte = new Date(from_date);
      if (to_date) query.pl_date.$lte = new Date(to_date);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [packingLists, total] = await Promise.all([
      PackingList.find(query)
        .populate('dc_id', 'dc_number so_number status')
        .populate('packed_by', 'FirstName LastName EmployeeID')
        .populate('verified_by', 'name email')
        .sort({ pl_date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      PackingList.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: packingLists,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('List packing lists error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createPackingList = async (req, res) => {
  try {
    const packingList = new PackingList(req.body);
    await packingList.save();
    
    await DeliveryChallan.findByIdAndUpdate(req.body.dc_id, {
      packing: {
        no_of_packages: packingList.total_packages,
        gross_weight_kg: packingList.total_gross_weight_kg,
        net_weight_kg: packingList.total_net_weight_kg
      },
      status: 'Packed'
    });
    
    res.status(201).json({ success: true, data: packingList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePackingList = async (req, res) => {
  try {
    const packingList = await PackingList.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!packingList) return res.status(404).json({ error: 'Packing list not found' });
    res.json({ success: true, data: packingList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPackingListByDC = async (req, res) => {
  try {
    const packingList = await PackingList.findOne({ dc_id: req.params.dcId });
    if (!packingList) return res.status(404).json({ error: 'Packing list not found' });
    res.json({ success: true, data: packingList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};