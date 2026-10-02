// controllers/employeeController.js
const Employee = require('../../models/HR/Employee');
const Salary = require('../../models/HR/Salary');
const EmployeeBehavior = require('../../models/HR/EmployeeBehavior');
const Department = require('../../models/HR/Department');
const Designation = require('../../models/HR/Designation');
const User = require('../../models/user_settings/User');
const mongoose = require('mongoose');

/**
 * @desc    Get all employees with advanced filtering
 * @route   GET /api/employees
 * @access  Private
 */
const getEmployees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      department,
      designation,
      employmentType,
      employmentStatus,
      skillLevel,
      search,
      contractCompany,
      sortBy = 'CreatedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Filter by department
    if (department) {
      if (mongoose.Types.ObjectId.isValid(department)) {
        query.DepartmentID = department;
      } else {
        const dept = await Department.findOne({ 
          DepartmentName: new RegExp(department, 'i') 
        });
        if (dept) query.DepartmentID = dept._id;
      }
    }

    // Filter by designation
    if (designation) {
      if (mongoose.Types.ObjectId.isValid(designation)) {
        query.DesignationID = designation;
      } else {
        const desg = await Designation.findOne({ 
          DesignationName: new RegExp(designation, 'i') 
        });
        if (desg) query.DesignationID = desg._id;
      }
    }

    // Filter by employment type
    if (employmentType) {
      query.EmploymentType = employmentType;
    }

    // Filter by employment status
    if (employmentStatus) {
      query.EmploymentStatus = employmentStatus;
    }

    // Filter by skill level
    if (skillLevel) {
      query.SkillLevel = skillLevel;
    }

    // Filter by contract company
    if (contractCompany) {
      const validCompanies = ['DISTIL', 'AARADHYA', 'MAHI'];
      if (validCompanies.includes(contractCompany.toUpperCase())) {
        query.ContractCompany = contractCompany.toUpperCase();
      } else {
        query.ContractCompany = { $in: [] };
      }
    }

    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { EmployeeID: searchRegex },
        { FirstName: searchRegex },
        { LastName: searchRegex },
        { Email: searchRegex },
        { Phone: searchRegex },
        { 'BankDetails.accountNumber': searchRegex },
        { PAN: searchRegex },
        { AadharNumber: searchRegex },
        { ContractCompany: searchRegex } 
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const employees = await Employee.find(query)
      .populate('DepartmentID', 'DepartmentName Description')
      .populate('DesignationID', 'DesignationName Level Description')
      .populate('SupervisorID', 'EmployeeID FirstName LastName')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort(sort);

    // Get total count for pagination
    const total = await Employee.countDocuments(query);

    // Calculate total fixed salary for each employee (virtual field)
    const employeesWithTotal = employees.map(emp => ({
      ...emp.toObject(),
      TotalFixedSalary: emp.TotalFixedSalary
    }));

    res.json({
      success: true,
      count: employees.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
        hasNextPage: parseInt(page) * parseInt(limit) < total,
        hasPrevPage: parseInt(page) > 1
      },
      data: employeesWithTotal
    });

  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get single employee by ID
 * @route   GET /api/employees/:id
 * @access  Private
 */
const getEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid employee ID format' 
      });
    }

    const employee = await Employee.findById(id)
      .populate('DepartmentID', 'DepartmentName Description')
      .populate('DesignationID', 'DesignationName Level Description')
      .populate('SupervisorID', 'EmployeeID FirstName LastName DesignationID');

    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    const employeeData = {
      ...employee.toObject(),
      FullName: employee.FullName,
      TotalFixedSalary: employee.TotalFixedSalary
    };

    res.json({
      success: true,
      data: employeeData
    });

  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

/**
 * @desc    Create new employee
 * @route   POST /api/employees
 * @access  Private/Admin
 */
const createEmployee = async (req, res) => {
  try {
    console.log('Creating employee with data:', JSON.stringify(req.body, null, 2));

    let employeeID;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      const lastEmployee = await Employee.findOne().sort({ CreatedAt: -1 }).select('EmployeeID');
      
      let employeeNumber = 1;
      
      if (lastEmployee && lastEmployee.EmployeeID) {
        const match = lastEmployee.EmployeeID.match(/\d+/);
        if (match) {
          employeeNumber = parseInt(match[0]) + 1 + attempts;
        }
      }
      
      employeeID = `EMP${employeeNumber.toString().padStart(5, '0')}`;
      
      const existingEmployee = await Employee.findOne({ EmployeeID: employeeID });
      if (!existingEmployee) {
        isUnique = true;
      } else {
        attempts++;
        console.log(`EmployeeID ${employeeID} already exists, trying again... (attempt ${attempts})`);
      }
    }

    if (!isUnique) {
      return res.status(500).json({
        success: false,
        message: 'Unable to generate unique Employee ID after multiple attempts'
      });
    }

    console.log(`Generated unique EmployeeID: ${employeeID}`);

    const requiredFields = [
      'FirstName', 'LastName', 'Gender', 'DateOfBirth',
      'Email', 'Phone', 'Address', 'DepartmentID',
      'DesignationID', 'DateOfJoining'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.body.DepartmentID)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Department ID format'
      });
    }

    const department = await Department.findById(req.body.DepartmentID);
    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Department not found'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.body.DesignationID)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Designation ID format'
      });
    }

    const designation = await Designation.findById(req.body.DesignationID);
    if (!designation) {
      return res.status(400).json({
        success: false,
        message: 'Designation not found'
      });
    }

    if (req.body.SupervisorID) {
      if (!mongoose.Types.ObjectId.isValid(req.body.SupervisorID)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Supervisor ID format'
        });
      }
      
      const supervisor = await Employee.findById(req.body.SupervisorID);
      if (!supervisor) {
        return res.status(400).json({
          success: false,
          message: 'Supervisor not found'
        });
      }
      
      if (supervisor.EmploymentStatus !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Supervisor is not an active employee'
        });
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.Email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    const dob = new Date(req.body.DateOfBirth);
    const doj = new Date(req.body.DateOfJoining);
    const ageDiff = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiff);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 18) {
      return res.status(400).json({
        success: false,
        message: 'Employee must be at least 18 years old'
      });
    }

    const existingEmail = await Employee.findOne({ Email: req.body.Email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    if (req.body.EmploymentType === 'contract-based') {
      if (!req.body.ContractCompany) {
        return res.status(400).json({
          success: false,
          message: 'ContractCompany is required for contract-based employees'
        });
      }
      if (!['DISTIL', 'AARADHYA', 'MAHI'].includes(req.body.ContractCompany)) {
        return res.status(400).json({
          success: false,
          message: 'ContractCompany must be one of: DISTIL, AARADHYA, MAHI'
        });
      }
    }

    if (req.body.EmploymentType === 'PieceRate' && req.body.PayStructureType !== 'PieceRate') {
      return res.status(400).json({
        success: false,
        message: 'PieceRate employees must have PayStructureType set to "PieceRate"'
      });
    }

    const employeeData = {
      EmployeeID: employeeID,
      FirstName: req.body.FirstName.trim(),
      LastName: req.body.LastName.trim(),
      Gender: req.body.Gender.toUpperCase(),
      DateOfBirth: dob,
      Email: req.body.Email.toLowerCase().trim(),
      Phone: req.body.Phone.trim(),
      Address: req.body.Address.trim(),
      DepartmentID: department._id,
      DesignationID: designation._id,
      DateOfJoining: doj,
      EmploymentStatus: req.body.EmploymentStatus || 'active',
      EmploymentType: req.body.EmploymentType || 'Monthly',
      PayStructureType: req.body.PayStructureType || 'Fixed',
      BasicSalary: req.body.BasicSalary || 0,
      HRA: req.body.HRA || 0,
      ConveyanceAllowance: req.body.ConveyanceAllowance || 0,
      MedicalAllowance: req.body.MedicalAllowance || 0,
      SpecialAllowance: req.body.SpecialAllowance || 0,
      HourlyRate: req.body.HourlyRate || 0,
      OvertimeRateMultiplier: req.body.OvertimeRateMultiplier || 1.5,
      SkillLevel: req.body.SkillLevel || 'Semi-Skilled',
      WorkStation: req.body.WorkStation || '',
      LineNumber: req.body.LineNumber || '',
      PAN: req.body.PAN || '',
      AadharNumber: req.body.AadharNumber || '',
      PFNumber: req.body.PFNumber || '',
      UAN: req.body.UAN || '',
      ESINumber: req.body.ESINumber || ''
    };
    
    if (req.body.EmploymentType === 'contract-based') {
      employeeData.ContractCompany = req.body.ContractCompany;
    } else {
      employeeData.ContractCompany = undefined;
    }
    
    if (req.body.SupervisorID && mongoose.Types.ObjectId.isValid(req.body.SupervisorID)) {
      employeeData.SupervisorID = req.body.SupervisorID;
    }

    if (req.body.BankDetails) {
      employeeData.BankDetails = {
        accountNumber: req.body.BankDetails.accountNumber || '',
        accountHolderName: req.body.BankDetails.accountHolderName || '',
        bankName: req.body.BankDetails.bankName || '',
        branch: req.body.BankDetails.branch || '',
        ifscCode: req.body.BankDetails.ifscCode || '',
        accountType: req.body.BankDetails.accountType || 'Savings'
      };
    }

    if (req.body.EmergencyContact) {
      employeeData.EmergencyContact = {
        name: req.body.EmergencyContact.name || '',
        relationship: req.body.EmergencyContact.relationship || '',
        phone: req.body.EmergencyContact.phone || '',
        address: req.body.EmergencyContact.address || ''
      };
    }

    console.log('Creating employee with prepared data...');
    
    try {
      const employee = await Employee.create(employeeData);
      console.log('Employee created successfully:', employee.EmployeeID);

      try {
        await employee.populate([
          { path: 'DepartmentID', select: 'DepartmentName Description', model: 'Department' },
          { path: 'DesignationID', select: 'DesignationName Level Description', model: 'Designation' }
        ]);

        if (employee.SupervisorID) {
          await employee.populate({
            path: 'SupervisorID',
            select: 'EmployeeID FirstName LastName DesignationID',
            populate: { path: 'DesignationID', select: 'DesignationName' }
          });
        }
      } catch (populateError) {
        console.warn('Population error (non-critical):', populateError.message);
      }

      const employeeResponse = {
        ...employee.toObject(),
        FullName: employee.FullName,
        TotalFixedSalary: employee.TotalFixedSalary
      };

      return res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: employeeResponse
      });
      
    } catch (createError) {
      if (createError.code === 11000 && createError.keyPattern?.EmployeeID) {
        console.log('Duplicate EmployeeID detected, retrying with new ID...');
        
        const timestamp = Date.now().toString().slice(-5);
        const newEmployeeID = `EMP${timestamp}`;
        employeeData.EmployeeID = newEmployeeID;
        
        const employee = await Employee.create(employeeData);
        console.log('Employee created successfully on retry:', employee.EmployeeID);
        
        return res.status(201).json({
          success: true,
          message: 'Employee created successfully',
          data: {
            ...employee.toObject(),
            FullName: employee.FullName,
            TotalFixedSalary: employee.TotalFixedSalary
          }
        });
      }
      
      throw createError;
    }

  } catch (error) {
    console.error('Create employee error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
      stack: error.stack
    });
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      const value = error.keyValue?.[field];
      return res.status(400).json({ 
        success: false, 
        message: `${field} '${value}' already exists. Please use a different value.`
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map(err => 
        `${err.path}: ${err.message}`
      );
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid ${error.path}: ${error.value}. Must be a valid ObjectId.`
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Error creating employee',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update employee
 * @route   PUT /api/employees/:id
 * @access  Private/Admin
 */
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid employee ID format' 
      });
    }

    let employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    if (req.body.DepartmentID) {
      if (!mongoose.Types.ObjectId.isValid(req.body.DepartmentID)) {
        return res.status(400).json({ success: false, message: 'Invalid Department ID format' });
      }
      const department = await Department.findById(req.body.DepartmentID);
      if (!department) {
        return res.status(400).json({ success: false, message: 'Department not found' });
      }
    }

    if (req.body.DesignationID) {
      if (!mongoose.Types.ObjectId.isValid(req.body.DesignationID)) {
        return res.status(400).json({ success: false, message: 'Invalid Designation ID format' });
      }
      const designation = await Designation.findById(req.body.DesignationID);
      if (!designation) {
        return res.status(400).json({ success: false, message: 'Designation not found' });
      }
    }

    if (req.body.SupervisorID) {
      if (req.body.SupervisorID === id) {
        return res.status(400).json({ success: false, message: 'Employee cannot be their own supervisor' });
      }
      if (!mongoose.Types.ObjectId.isValid(req.body.SupervisorID)) {
        return res.status(400).json({ success: false, message: 'Invalid Supervisor ID format' });
      }
      const supervisor = await Employee.findById(req.body.SupervisorID);
      if (!supervisor) {
        return res.status(400).json({ success: false, message: 'Supervisor not found' });
      }
      if (supervisor.EmploymentStatus !== 'active') {
        return res.status(400).json({ success: false, message: 'Supervisor must be an active employee' });
      }
    }

    if (req.body.Email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.Email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }
      
      const existingEmail = await Employee.findOne({ 
        Email: req.body.Email,
        _id: { $ne: id }
      });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email already registered to another employee' });
      }
    }

    if (req.body.DateOfBirth) {
      const dob = new Date(req.body.DateOfBirth);
      const ageDiff = Date.now() - dob.getTime();
      const ageDate = new Date(ageDiff);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      
      if (age < 18) {
        return res.status(400).json({ success: false, message: 'Employee must be at least 18 years old' });
      }
    }

    if (req.body.EmploymentType === 'PieceRate' && req.body.PayStructureType && req.body.PayStructureType !== 'PieceRate') {
      return res.status(400).json({ success: false, message: 'PieceRate employees must have PayStructureType set to "PieceRate"' });
    }

    if (req.body.PayStructureType === 'PieceRate' && req.body.EmploymentType && req.body.EmploymentType !== 'PieceRate') {
      return res.status(400).json({ success: false, message: 'Employees with PieceRate pay structure must have EmploymentType set to "PieceRate"' });
    }

    if (req.body.EmployeeID && req.body.EmployeeID !== employee.EmployeeID) {
      return res.status(400).json({ success: false, message: 'Employee ID cannot be changed' });
    }

    const updateData = { ...req.body };
    
    delete updateData.EmployeeID;
    delete updateData.CreatedAt;
    delete updateData.PieceRateDetails;

    if (req.body.EmploymentType === 'contract-based') {
      if (!req.body.ContractCompany && !employee.ContractCompany) {
        return res.status(400).json({ success: false, message: 'ContractCompany is required for contract-based employees' });
      }
      if (req.body.ContractCompany && !['DISTIL', 'AARADHYA', 'MAHI'].includes(req.body.ContractCompany)) {
        return res.status(400).json({ success: false, message: 'ContractCompany must be one of: DISTIL, AARADHYA, MAHI' });
      }
    }

    if (req.body.ContractCompany !== undefined) {
      updateData.ContractCompany = req.body.ContractCompany;
    }
    updateData.UpdatedAt = Date.now();

    if (req.body.BankDetails) {
      updateData['BankDetails'] = {
        accountNumber: req.body.BankDetails.accountNumber || employee.BankDetails?.accountNumber || '',
        accountHolderName: req.body.BankDetails.accountHolderName || employee.BankDetails?.accountHolderName || '',
        bankName: req.body.BankDetails.bankName || employee.BankDetails?.bankName || '',
        branch: req.body.BankDetails.branch || employee.BankDetails?.branch || '',
        ifscCode: req.body.BankDetails.ifscCode || employee.BankDetails?.ifscCode || '',
        accountType: req.body.BankDetails.accountType || employee.BankDetails?.accountType || 'Savings'
      };
    }

    if (req.body.EmergencyContact) {
      updateData['EmergencyContact'] = {
        name: req.body.EmergencyContact.name || employee.EmergencyContact?.name || '',
        relationship: req.body.EmergencyContact.relationship || employee.EmergencyContact?.relationship || '',
        phone: req.body.EmergencyContact.phone || employee.EmergencyContact?.phone || '',
        address: req.body.EmergencyContact.address || employee.EmergencyContact?.address || ''
      };
    }

    employee = await Employee.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true, context: 'query' }
    ).populate([
      { path: 'DepartmentID', select: 'DepartmentName Description' },
      { path: 'DesignationID', select: 'DesignationName Level Description' },
      { path: 'SupervisorID', select: 'EmployeeID FirstName LastName DesignationID' }
    ]);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found after update' });
    }

    if (req.body.EmploymentType === 'PieceRate' && employee.EmploymentType === 'PieceRate') {
      if (employee.BasicSalary > 0 || employee.HRA > 0) {
        console.log('PieceRate employee has salary components - these may be ignored in payroll');
      }
    }

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: {
        ...employee.toObject(),
        FullName: employee.FullName,
        TotalFixedSalary: employee.TotalFixedSalary,
      }
    });

  } catch (error) {
    console.error('Update employee error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ success: false, message: `${field} already exists` });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: `Invalid ${error.path}: ${error.value}. Must be a valid ObjectId.` });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete employee (soft delete by changing status)
 * @route   DELETE /api/employees/:id
 * @access  Private/Admin
 */
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid employee ID format' });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const userExists = await User.findOne({ EmployeeID: employee._id });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete employee with active user account. Delete user account first.' 
      });
    }

    employee.EmploymentStatus = 'terminated';
    employee.UpdatedAt = Date.now();
    await employee.save();

    res.json({
      success: true,
      message: 'Employee status changed to terminated successfully'
    });

  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Hard delete employee (permanent removal - use with caution)
 * @route   DELETE /api/employees/:id/hard
 * @access  Private/SuperAdmin
 */
const hardDeleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid employee ID format' });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const userExists = await User.findOne({ EmployeeID: employee._id });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Cannot delete employee with active user account' });
    }

    const Attendance = require('../../models/HR/Attendance');
    const Leave = require('../../models/HR/Leave');
    
    const hasAttendance = await Attendance.exists({ EmployeeID: employee._id });
    const hasLeave = await Leave.exists({ EmployeeID: employee._id });
    const hasSalary = await Salary.exists({ EmployeeID: employee._id });
    
    if (hasAttendance || hasLeave || hasSalary) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete employee with existing records (attendance, leaves, or salary). Archive instead.' 
      });
    }

    await Employee.findByIdAndDelete(id);

    res.json({ success: true, message: 'Employee permanently deleted' });

  } catch (error) {
    console.error('Hard delete employee error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Bulk delete employees
 * @route   DELETE /api/employees/bulk
 * @access  Private/SuperAdmin
 */
const bulkDeleteEmployees = async (req, res) => {
  try {
    const { employeeIds } = req.body;

    if (!employeeIds || employeeIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No employees selected for deletion' 
      });
    }

    // Validate all IDs
    const invalidIds = employeeIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'One or more employee IDs are invalid' 
      });
    }

    // Safety Check 1: Do any of the employees have active user accounts?
    const usersExist = await User.countDocuments({ EmployeeID: { $in: employeeIds } });
    if (usersExist > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete employees. ${usersExist} employee(s) have active user accounts. Delete user accounts first.` 
      });
    }

    // Safety Check 2: Do any of the employees have related records?
    const Attendance = require('../../models/HR/Attendance');
    const Leave = require('../../models/HR/Leave');
    
    const hasAttendance = await Attendance.countDocuments({ EmployeeID: { $in: employeeIds } });
    const hasLeave = await Leave.countDocuments({ EmployeeID: { $in: employeeIds } });
    const hasSalary = await Salary.countDocuments({ EmployeeID: { $in: employeeIds } });
    
    if (hasAttendance > 0 || hasLeave > 0 || hasSalary > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete selected employees. They have existing records (attendance, leaves, or salary). Archive instead.' 
      });
    }

    // Perform the bulk delete
    const result = await Employee.deleteMany({ _id: { $in: employeeIds } });

    res.json({ 
      success: true, 
      message: `${result.deletedCount} employee(s) deleted successfully` 
    });

  } catch (error) {
    console.error("❌ Error in bulk delete:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * @desc    Get employee statistics
 * @route   GET /api/employees/dashboard/stats
 * @access  Private
 */
const getEmployeeStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ EmploymentStatus: 'active' });
    const resignedEmployees = await Employee.countDocuments({ EmploymentStatus: 'resigned' });
    const terminatedEmployees = await Employee.countDocuments({ EmploymentStatus: 'terminated' });
    const retiredEmployees = await Employee.countDocuments({ EmploymentStatus: 'retired' });

    const employmentTypeStats = await Employee.aggregate([
      { $group: { _id: '$EmploymentType', count: { $sum: 1 } } },
      { $project: { type: '$_id', count: 1, _id: 0 } }
    ]);

    const departmentStats = await Employee.aggregate([
      { $lookup: { from: 'departments', localField: 'DepartmentID', foreignField: '_id', as: 'department' } },
      { $unwind: '$department' },
      { $group: { _id: '$department.DepartmentName', count: { $sum: 1 }, avgSalary: { $avg: '$BasicSalary' } } },
      { $sort: { count: -1 } }
    ]);

    const genderStats = await Employee.aggregate([
      { $group: { _id: '$Gender', count: { $sum: 1 } } }
    ]);

    const skillLevelStats = await Employee.aggregate([
      { $group: { _id: '$SkillLevel', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const joiningTrend = await Employee.aggregate([
      { $match: { DateOfJoining: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$DateOfJoining' }, month: { $month: '$DateOfJoining' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $project: { 
        month: { $concat: [
          { $toString: '$_id.year' }, '-',
          { $toString: { $cond: [{ $lt: ['$_id.month', 10] }, '0', ''] } },
          { $toString: '$_id.month' }
        ]},
        count: 1, _id: 0 
      }}
    ]);

    const salaryStats = await Employee.aggregate([
      { $match: { EmploymentStatus: 'active', BasicSalary: { $gt: 0 } } },
      { $group: { 
        _id: null, 
        avgSalary: { $avg: '$BasicSalary' }, 
        minSalary: { $min: '$BasicSalary' }, 
        maxSalary: { $max: '$BasicSalary' }, 
        totalSalary: { $sum: '$BasicSalary' } 
      }}
    ]);

    res.json({
      success: true,
      data: {
        counts: { total: totalEmployees, active: activeEmployees, resigned: resignedEmployees, terminated: terminatedEmployees, retired: retiredEmployees },
        distributions: { employmentType: employmentTypeStats, department: departmentStats, gender: genderStats, skillLevel: skillLevelStats },
        trends: { joining: joiningTrend },
        salary: salaryStats[0] || { avgSalary: 0, minSalary: 0, maxSalary: 0, totalSalary: 0 }
      }
    });

  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getEmployeeYearlySummary = async (req, res) => {
  try {
    const { employeeId, year } = req.params;
    const targetYear = parseInt(year) || new Date().getFullYear();

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ success: false, message: 'Invalid employee ID format' });
    }

    const employee = await Employee.findById(employeeId)
      .select('EmployeeID FirstName LastName DepartmentID DesignationID EmploymentType')
      .populate('DepartmentID', 'DepartmentName')
      .populate('DesignationID', 'DesignationName');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const overtimeData = await Salary.aggregate([
      { $match: {
        employee: new mongoose.Types.ObjectId(employeeId),
        'payrollPeriod.year': targetYear,
        overtimeHours: { $gt: 0 }
      }},
      { $group: {
        _id: { month: '$payrollPeriod.month', year: '$payrollPeriod.year' },
        totalOvertimeHours: { $sum: '$overtimeHours' },
        overtimeAmount: { $sum: '$earnings.overtime' },
        records: { $push: '$$ROOT' }
      }},
      { $sort: { '_id.month': 1 } },
      { $project: {
        _id: 0, month: '$_id.month', year: '$_id.year',
        totalOvertimeHours: 1, overtimeAmount: 1,
        monthName: { $arrayElemAt: [
          ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          '$_id.month'
        ]}
      }}
    ]);

    const monthlyOvertimeDetails = await Salary.find({
      employee: employeeId,
      'payrollPeriod.year': targetYear,
      overtimeHours: { $gt: 0 }
    })
    .select('payrollPeriod overtimeHours overtimeRate earnings overtimeHours')
    .sort('payrollPeriod.month');

    const behaviorData = await EmployeeBehavior.aggregate([
      { $match: {
        employeeId: new mongoose.Types.ObjectId(employeeId),
        createdAt: { $gte: new Date(`${targetYear}-01-01`), $lte: new Date(`${targetYear}-12-31`) },
        isDeleted: false
      }},
      { $facet: {
        monthlyBreakdown: [
          { $group: {
            _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
            totalEntries: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            positiveCount: { $sum: { $cond: [{ $eq: ['$type', 'Positive'] }, 1, 0] } },
            negativeCount: { $sum: { $cond: [{ $eq: ['$type', 'Negative'] }, 1, 0] } },
            neutralCount: { $sum: { $cond: [{ $eq: ['$type', 'Neutral'] }, 1, 0] } },
            openIssues: { $sum: { $cond: [{ $eq: ['$status', 'Open'] }, 1, 0] } },
            resolvedIssues: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
            escalatedIssues: { $sum: { $cond: [{ $eq: ['$status', 'Escalated'] }, 1, 0] } },
            categories: { $push: '$category' }
          }},
          { $sort: { '_id.month': 1 } },
          { $project: {
            _id: 0, month: '$_id.month', year: '$_id.year',
            monthName: { $arrayElemAt: [
              ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              '$_id.month'
            ]},
            totalEntries: 1, averageRating: { $round: ['$averageRating', 1] },
            positiveCount: 1, negativeCount: 1, neutralCount: 1,
            openIssues: 1, resolvedIssues: 1, escalatedIssues: 1, categories: 1
          }}
        ],
        categoryWise: [
          { $group: {
            _id: '$category', count: { $sum: 1 }, avgRating: { $avg: '$rating' },
            positiveCount: { $sum: { $cond: [{ $eq: ['$type', 'Positive'] }, 1, 0] } },
            negativeCount: { $sum: { $cond: [{ $eq: ['$type', 'Negative'] }, 1, 0] } }
          }},
          { $project: {
            category: '$_id', count: 1,
            avgRating: { $round: ['$avgRating', 1] },
            positiveCount: 1, negativeCount: 1, _id: 0
          }}
        ],
        overallStats: [
          { $group: {
            _id: null, totalEntries: { $sum: 1 },
            overallAvgRating: { $avg: '$rating' },
            totalPositive: { $sum: { $cond: [{ $eq: ['$type', 'Positive'] }, 1, 0] } },
            totalNegative: { $sum: { $cond: [{ $eq: ['$type', 'Negative'] }, 1, 0] } },
            totalNeutral: { $sum: { $cond: [{ $eq: ['$type', 'Neutral'] }, 1, 0] } },
            openCount: { $sum: { $cond: [{ $eq: ['$status', 'Open'] }, 1, 0] } },
            resolvedCount: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
            escalatedCount: { $sum: { $cond: [{ $eq: ['$status', 'Escalated'] }, 1, 0] } }
          }},
          { $project: {
            _id: 0, totalEntries: 1,
            overallAvgRating: { $round: ['$overallAvgRating', 1] },
            totalPositive: 1, totalNegative: 1, totalNeutral: 1,
            openCount: 1, resolvedCount: 1, escalatedCount: 1
          }}
        ]
      }}
    ]);

    const recentBehavior = await EmployeeBehavior.find({
      employeeId: employeeId,
      isDeleted: false
    })
    .populate('submittedBy', 'username email')
    .populate('resolvedBy', 'username email')
    .sort('-createdAt')
    .limit(10);

    const yearlyTotals = {
      totalOvertimeHours: overtimeData.reduce((sum, item) => sum + (item.totalOvertimeHours || 0), 0),
      totalOvertimeAmount: overtimeData.reduce((sum, item) => sum + (item.overtimeAmount || 0), 0),
      monthsWithOvertime: overtimeData.length,
      totalBehaviorEntries: behaviorData[0]?.overallStats[0]?.totalEntries || 0,
      averageBehaviorRating: behaviorData[0]?.overallStats[0]?.overallAvgRating || 0,
      positiveBehaviorCount: behaviorData[0]?.overallStats[0]?.totalPositive || 0,
      negativeBehaviorCount: behaviorData[0]?.overallStats[0]?.totalNegative || 0,
      openIssuesCount: behaviorData[0]?.overallStats[0]?.openCount || 0
    };

    const summary = {
      employee: {
        id: employee._id,
        employeeId: employee.EmployeeID,
        name: `${employee.FirstName} ${employee.LastName}`,
        department: employee.DepartmentID,
        designation: employee.DesignationID,
        employmentType: employee.EmploymentType
      },
      year: targetYear,
      summary: yearlyTotals,
      overtime: {
        monthlyBreakdown: overtimeData,
        detailedRecords: monthlyOvertimeDetails,
        yearlyTotal: yearlyTotals.totalOvertimeHours
      },
      behavior: {
        monthlyBreakdown: behaviorData[0]?.monthlyBreakdown || [],
        categoryWise: behaviorData[0]?.categoryWise || [],
        overallStats: behaviorData[0]?.overallStats[0] || {
          totalEntries: 0, overallAvgRating: 0,
          totalPositive: 0, totalNegative: 0, totalNeutral: 0,
          openCount: 0, resolvedCount: 0, escalatedCount: 0
        },
        recentEntries: recentBehavior
      },
      generatedAt: new Date()
    };

    res.status(200).json({ success: true, data: summary });

  } catch (error) {
    console.error('Error generating employee yearly summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating employee summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  hardDeleteEmployee,
  bulkDeleteEmployees, // 👈 Added this
  getEmployeeStats,
  getEmployeeYearlySummary
};