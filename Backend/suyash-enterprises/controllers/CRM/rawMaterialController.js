const RawMaterial = require('../../models/CRM/RawMaterial');
const Material = require('../../models/CRM/Material');

// @desc    Get all raw materials
// @route   GET /api/raw-materials
// @access  Private
const getRawMaterials = async (req, res) => {
  try {
    const { page = 1, limit = 10, materialName, grade, isActive } = req.query;
    
    const query = {};
    if (isActive !== undefined) query.IsActive = isActive === 'true';
    if (materialName) query.MaterialName = new RegExp(materialName, 'i');
    if (grade) query.Grade = new RegExp(grade, 'i');
    
    const rawMaterials = await RawMaterial.find(query)
      .populate('MaterialID', 'MaterialCode MaterialName Density Unit Grade Standard')
      .populate('CreatedBy', 'Username Email')
      .populate('UpdatedBy', 'Username Email')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1, MaterialName: 1, Grade: 1 });
    
    const total = await RawMaterial.countDocuments(query);
    
    res.json({
      success: true,
      data: rawMaterials,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get raw materials error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get current raw material rates (latest per material)
// @route   GET /api/raw-materials/current-rates
// @access  Private
const getCurrentRates = async (req, res) => {
  try {
    const currentRates = await RawMaterial.aggregate([
      { $match: { IsActive: true } },
      { $sort: { MaterialID: 1, DateEffective: -1 } },
      {
        $group: {
          _id: '$MaterialID',
          latestRate: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$latestRate' } },
      { $sort: { MaterialName: 1, Grade: 1 } }
    ]);
    
    // Populate MaterialID reference
    await RawMaterial.populate(currentRates, { path: 'MaterialID', select: 'MaterialCode MaterialName Density Unit Grade' });
    
    res.json({ success: true, data: currentRates });
  } catch (error) {
    console.error('Get current rates error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single raw material
// @route   GET /api/raw-materials/:id
// @access  Private
const getRawMaterial = async (req, res) => {
  try {
    const rawMaterial = await RawMaterial.findById(req.params.id)
      .populate('MaterialID', 'MaterialCode MaterialName Density Unit Grade Standard Color')
      .populate('CreatedBy', 'Username Email')
      .populate('UpdatedBy', 'Username Email');
    
    if (!rawMaterial) {
      return res.status(404).json({ success: false, message: 'Raw material not found' });
    }
    
    res.json({ success: true, data: rawMaterial });
  } catch (error) {
    console.error('Get raw material error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Raw material not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create raw material (AUTO-FILL from Material Master)
// @route   POST /api/raw-materials
// @access  Private
const createRawMaterial = async (req, res) => {
  try {
    const { MaterialID, RatePerKG, ScrapPercentage, TransportLossPercentage, DateEffective, Description, profile_conversion_rate } = req.body;
    
    // Validate MaterialID
    if (!MaterialID) {
      return res.status(400).json({ success: false, message: 'MaterialID is required' });
    }
    
    // Fetch from Material Master
    const material = await Material.findById(MaterialID);
    
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found in Material Master' });
    }
    
    if (!material.Grade) {
      return res.status(400).json({ success: false, message: 'Material must have a Grade defined in Material Master' });
    }
    
    // Check if rate already exists for this MaterialID and DateEffective
    // const existing = await RawMaterial.findOne({
    //   MaterialID: MaterialID,
    //   DateEffective: new Date(DateEffective || new Date())
    // });
    
    // if (existing) {
    //   return res.status(400).json({
    //     success: false,
    //     message: `Rate already exists for ${material.MaterialName} - ${material.Grade} on ${new Date(DateEffective).toISOString().split('T')[0]}`
    //   });
    // }
    
    // Auto-create raw material data from Material Master
    const rawMaterialData = {
      MaterialID: material._id,
      MaterialName: material.MaterialName,
      Grade: material.Grade,
      density: material.Density,
      unit: material.Unit,
      Description: Description || `Rate for ${material.MaterialName} - ${material.Grade}`,
      RatePerKG: RatePerKG,
      profile_conversion_rate: profile_conversion_rate || 0,
      ScrapPercentage: ScrapPercentage || 0,
      TransportLossPercentage: TransportLossPercentage || 0,
      DateEffective: DateEffective || new Date(),
      CreatedBy: req.user._id,
      UpdatedBy: req.user._id
    };
    
    const rawMaterial = await RawMaterial.create(rawMaterialData);
    
    const populatedRawMaterial = await RawMaterial.findById(rawMaterial._id)
      .populate('MaterialID', 'MaterialCode MaterialName Density Unit Grade')
      .populate('CreatedBy', 'Username Email');
    
    res.status(201).json({
      success: true,
      data: populatedRawMaterial,
      message: 'Raw material rate created successfully'
    });
  } catch (error) {
    console.error('Create raw material error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Raw material rate already exists for this material and date'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// @desc    Update raw material
// @route   PUT /api/raw-materials/:id
// @access  Private
const updateRawMaterial = async (req, res) => {
  try {
    const rawMaterial = await RawMaterial.findById(req.params.id);
    
    if (!rawMaterial) {
      return res.status(404).json({ success: false, message: 'Raw material not found' });
    }
    
    // Prevent updating MaterialID
    delete req.body.MaterialID;
    delete req.body.MaterialName;
    delete req.body.Grade;
    delete req.body.density;
    delete req.body.unit;
    
    const updatedRawMaterial = await RawMaterial.findByIdAndUpdate(
      req.params.id,
      { ...req.body, UpdatedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate('MaterialID', 'MaterialCode MaterialName Density Unit Grade')
      .populate('CreatedBy', 'Username Email')
      .populate('UpdatedBy', 'Username Email');
    
    res.json({
      success: true,
      data: updatedRawMaterial,
      message: 'Raw material rate updated successfully'
    });
  } catch (error) {
    console.error('Update raw material error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Raw material not found' });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete raw material (soft delete)
// @route   DELETE /api/raw-materials/:id
// @access  Private
const deleteRawMaterial = async (req, res) => {
  try {
    const rawMaterial = await RawMaterial.findById(req.params.id);
    
    if (!rawMaterial) {
      return res.status(404).json({ success: false, message: 'Raw material not found' });
    }
    
    rawMaterial.IsActive = false;
    rawMaterial.UpdatedBy = req.user._id;
    await rawMaterial.save();
    
    res.json({ success: true, message: 'Raw material rate deactivated successfully' });
  } catch (error) {
    console.error('Delete raw material error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Raw material not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get raw materials for dropdown
// @route   GET /api/raw-materials/dropdown
// @access  Private
const getRawMaterialsDropdown = async (req, res) => {
  try {
    const rawMaterials = await RawMaterial.find({ IsActive: true })
      .populate('MaterialID', 'MaterialCode MaterialName')
      .select('MaterialID MaterialName Grade RatePerKG EffectiveRate')
      .sort({ MaterialName: 1, Grade: 1 });
    
    res.json({ success: true, data: rawMaterials });
  } catch (error) {
    console.error('Get raw materials dropdown error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get rate by MaterialID (for quotation costing)
// @route   GET /api/raw-materials/rate-by-material/:materialId
// @access  Private
const getRateByMaterialId = async (req, res) => {
  try {
    const { materialId } = req.params;
    const { asOnDate } = req.query;
    
    const query = {
      MaterialID: materialId,
      IsActive: true,
      DateEffective: { $lte: asOnDate ? new Date(asOnDate) : new Date() }
    };
    
    const rate = await RawMaterial.findOne(query)
      .sort({ DateEffective: -1 })
      .populate('MaterialID', 'MaterialCode MaterialName Density Unit Grade');
    
    if (!rate) {
      return res.status(404).json({
        success: false,
        message: 'No active rate found for this material'
      });
    }
    
    res.json({ success: true, data: rate });
  } catch (error) {
    console.error('Get rate by material ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Bulk create/update raw materials
// @route   POST /api/raw-materials/bulk
// @access  Private
const bulkCreateRawMaterials = async (req, res) => {
  try {
    const materials = req.body;
    const userId = req.user._id;
    const results = { created: 0, updated: 0, failed: 0, errors: [] };
    
    for (const item of materials) {
      try {
        // Find Material by MaterialCode or Grade
        let material = await Material.findOne({
          $or: [
            { MaterialCode: item.MaterialCode },
            { Grade: item.Grade }
          ]
        });
        
        if (!material) {
          results.failed++;
          results.errors.push({ MaterialCode: item.MaterialCode, error: 'Material not found in Material Master' });
          continue;
        }
        
        const existing = await RawMaterial.findOne({
          MaterialID: material._id,
          DateEffective: new Date(item.DateEffective)
        });
        
        const rateData = {
          MaterialID: material._id,
          MaterialName: material.MaterialName,
          Grade: material.Grade,
          density: material.Density,
          unit: material.Unit,
          RatePerKG: item.RatePerKG,
          ScrapPercentage: item.ScrapPercentage || 0,
          TransportLossPercentage: item.TransportLossPercentage || 0,
          DateEffective: new Date(item.DateEffective),
          UpdatedBy: userId
        };
        
        if (existing) {
          await RawMaterial.updateOne({ _id: existing._id }, { $set: rateData });
          results.updated++;
        } else {
          rateData.CreatedBy = userId;
          await RawMaterial.create(rateData);
          results.created++;
        }
      } catch (err) {
        results.failed++;
        results.errors.push({ item, error: err.message });
      }
    }
    
    res.json({
      success: true,
      data: results,
      message: `Bulk operation completed: ${results.created} created, ${results.updated} updated, ${results.failed} failed`
    });
  } catch (error) {
    console.error('Bulk create raw materials error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getRawMaterials,
  getCurrentRates,
  getRawMaterial,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
  getRawMaterialsDropdown,
  bulkCreateRawMaterials,
  getRateByMaterialId
};
