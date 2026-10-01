const Agency = require('../../models/HR/agency');

// 1. CREATE AGENCY
exports.createAgency = async (req, res) => {
  try {
    const { agencyCode, agencyName, contactPerson, contactPhone, contactEmail, address, notes } = req.body;

    // Check if agency code already exists
    const existingAgency = await Agency.findOne({ agencyCode });
    if (existingAgency) {
      return res.status(400).json({ success: false, message: 'Agency Code already exists' });
    }

    const newAgency = new Agency({
      agencyCode,
      agencyName,
      contactPerson,
      contactPhone,
      contactEmail,
      address,
      notes,
      status: 'Active'
    });

    await newAgency.save();
    res.status(201).json({ success: true, message: 'Agency added successfully', data: newAgency });

  } catch (error) {
    console.error("❌ Error creating agency:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// 2. GET ALL AGENCIES
exports.getAgencies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const agencies = await Agency.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Agency.countDocuments();

    res.status(200).json({ 
      success: true, 
      data: agencies,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("❌ Error fetching agencies:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// 3. UPDATE AN AGENCY
exports.updateAgency = async (req, res) => {
  try {
    const { id } = req.params;
    const { agencyCode, agencyName, contactPerson, contactPhone, contactEmail, address, notes, status } = req.body;

    const updatedAgency = await Agency.findByIdAndUpdate(
      id,
      { agencyCode, agencyName, contactPerson, contactPhone, contactEmail, address, notes, status },
      { new: true, runValidators: true } // 'new: true' returns the updated document
    );

    if (!updatedAgency) {
      return res.status(404).json({ success: false, message: 'Agency not found' });
    }

    res.status(200).json({ success: true, message: 'Agency updated successfully', data: updatedAgency });
  } catch (error) {
    console.error("❌ Error updating agency:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// 4. DELETE A SINGLE AGENCY (This was missing!)
exports.deleteAgency = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAgency = await Agency.findByIdAndDelete(id);

    if (!deletedAgency) {
      return res.status(404).json({ success: false, message: 'Agency not found' });
    }

    res.status(200).json({ success: true, message: 'Agency deleted successfully' });
  } catch (error) {
    console.error("❌ Error deleting agency:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// 5. BULK DELETE AGENCIES (This was missing!)
exports.bulkDeleteAgencies = async (req, res) => {
  try {
    const { agencyIds } = req.body; // Array of IDs sent from frontend

    if (!agencyIds || agencyIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No agencies selected for deletion' });
    }

    await Agency.deleteMany({ _id: { $in: agencyIds } });
    res.status(200).json({ success: true, message: `${agencyIds.length} agencies deleted successfully` });
  } catch (error) {
    console.error("❌ Error in bulk delete:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};