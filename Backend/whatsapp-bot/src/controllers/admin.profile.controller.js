const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const adminService = require('../services/admin.service');

// GET /api/admin/profile
const getProfile = asyncHandler(async (req, res) => {
  const profile = await adminService.getProfile(req.admin._id);
  res.status(200).json(new ApiResponse(200, profile, 'Profile fetched successfully'));
});

// PUT /api/admin/profile
const updateProfile = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  if (req.file) {
    updates.profileImage = `/uploads/${req.file.filename}`;
  }
  const profile = await adminService.updateProfile(req.admin._id, updates);
  res.status(200).json(new ApiResponse(200, profile, 'Profile updated successfully'));
});

module.exports = { getProfile, updateProfile };
