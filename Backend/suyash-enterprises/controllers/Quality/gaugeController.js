// controllers/Quality/gaugeMasterController.js
const GaugeMaster = require('../../models/Quality/GaugeMaster');

// ======================================================
// REGISTER NEW GAUGE
// ======================================================
const registerGauge = async (req, res) => {
  try {
    const {
      gauge_name, gauge_type, gauge_code, make, model, serial_no,
      range, least_count, accuracy, department, location, custodian_id,
      calibration_frequency_days, last_calibration_date, calibration_agency,
      nabl_accredited, msa_required, gage_r_and_r_percent, bias, linearity,
    } = req.body;

    let next_calibration_date = null;
    if (last_calibration_date && calibration_frequency_days) {
      const base = new Date(last_calibration_date);
      base.setDate(base.getDate() + Number(calibration_frequency_days));
      next_calibration_date = base;
    }

    const status = next_calibration_date && new Date(next_calibration_date) > new Date()
      ? 'Calibrated'
      : 'Overdue';

    const gauge = new GaugeMaster({
      gauge_name, gauge_type, gauge_code, make, model, serial_no,
      range, least_count, accuracy, department, location, custodian_id,
      calibration_frequency_days, last_calibration_date, next_calibration_date,
      calibration_agency, nabl_accredited, msa_required,
      gage_r_and_r_percent, bias, linearity, status,
    });

    await gauge.save();
    return res.status(201).json({ success: true, data: gauge });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'gauge_code already exists' });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// GET ALL GAUGES (with filters, search & pagination)
// ======================================================
// const getAllGauges = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 20;
//     const skip = (page - 1) * limit;

//     const { status, department, gauge_type, search } = req.query;
//     const filter = { is_active: true };

//     if (status) filter.status = status;
//     if (department) filter.department = { $regex: department, $options: 'i' };
//     if (gauge_type) filter.gauge_type = gauge_type;

//     if (search) {
//       filter.$or = [
//         { gauge_name: { $regex: search, $options: 'i' } },
//         { gauge_code: { $regex: search, $options: 'i' } },
//         { serial_no: { $regex: search, $options: 'i' } },
//         { make: { $regex: search, $options: 'i' } },
//         { model: { $regex: search, $options: 'i' } },
//         { gauge_id: { $regex: search, $options: 'i' } },
//       ];
//     }

//     const sort_by = req.query.sort_by || 'createdAt';
//     const sort_order = req.query.sort_order === 'desc' ? -1 : 1;
//     const sort = {};
//     sort[sort_by] = sort_order;

//     const [gauges, total] = await Promise.all([
//       GaugeMaster.find(filter)
//         .populate('custodian_id', 'FirstName LastName EmployeeID')
//         .sort(sort)
//         .skip(skip)
//         .limit(limit),
//       GaugeMaster.countDocuments(filter),
//     ]);

//     const transformedGauges = gauges.map(gauge => {
//       const gaugeObj = gauge.toObject();
//       if (gaugeObj.custodian_id && gaugeObj.custodian_id.FirstName) {
//         gaugeObj.custodian_id = {
//           _id: gaugeObj.custodian_id._id,
//           name: `${gaugeObj.custodian_id.FirstName} ${gaugeObj.custodian_id.LastName || ''}`.trim(),
//           employee_code: gaugeObj.custodian_id.EmployeeID,
//         };
//       }
//       return gaugeObj;
//     });

//     const totalPages = Math.ceil(total / limit);

//     return res.json({
//       success: true,
//       count: transformedGauges.length,
//       total,
//       data: transformedGauges,
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages,
//         hasNextPage: page < totalPages,
//         hasPrevPage: page > 1,
//       },
//     });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };


const getAllGauges = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { status, department, gauge_type, search } = req.query;
    const filter = { is_active: true };

    if (status) filter.status = status;
    if (department) filter.department = { $regex: department, $options: 'i' };
    if (gauge_type) filter.gauge_type = gauge_type;

    if (search) {
      filter.$or = [
        { gauge_name: { $regex: search, $options: 'i' } },
        { gauge_code: { $regex: search, $options: 'i' } },
        { serial_no: { $regex: search, $options: 'i' } },
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { gauge_id: { $regex: search, $options: 'i' } },
      ];
    }

    // FIXED: Sort by createdAt in descending order (newest first)
    const sort = { createdAt: -1 };

    const [gauges, total] = await Promise.all([
      GaugeMaster.find(filter)
        .populate('custodian_id', 'FirstName LastName EmployeeID')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      GaugeMaster.countDocuments(filter),
    ]);

    const transformedGauges = gauges.map(gauge => {
      const gaugeObj = gauge.toObject();
      if (gaugeObj.custodian_id && gaugeObj.custodian_id.FirstName) {
        gaugeObj.custodian_id = {
          _id: gaugeObj.custodian_id._id,
          name: `${gaugeObj.custodian_id.FirstName} ${gaugeObj.custodian_id.LastName || ''}`.trim(),
          employee_code: gaugeObj.custodian_id.EmployeeID,
        };
      }
      return gaugeObj;
    });

    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      count: transformedGauges.length,
      total,
      data: transformedGauges,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// GET GAUGE BY ID
// ======================================================
const getGaugeById = async (req, res) => {
  try {
    const gauge = await GaugeMaster.findById(req.params.id)
      .populate('custodian_id', 'FirstName LastName EmployeeID');

    if (!gauge) {
      return res.status(404).json({ success: false, message: 'Gauge not found' });
    }

    const gaugeObj = gauge.toObject();
    if (gaugeObj.custodian_id && gaugeObj.custodian_id.FirstName) {
      gaugeObj.custodian_id = {
        _id: gaugeObj.custodian_id._id,
        name: `${gaugeObj.custodian_id.FirstName} ${gaugeObj.custodian_id.LastName || ''}`.trim(),
        employee_code: gaugeObj.custodian_id.EmployeeID,
      };
    }

    return res.json({ success: true, data: gaugeObj });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// GET CALIBRATION DUE REPORT
// ======================================================
const getCalibrationDue = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const future = new Date();
    future.setDate(today.getDate() + days);

    const filter = {
      is_active: true,
      $or: [
        { status: 'Overdue' },
        {
          status: 'Calibrated',
          next_calibration_date: { $lte: future },
        },
      ],
    };

    const [gauges, total] = await Promise.all([
      GaugeMaster.find(filter)
        .select('gauge_id gauge_name gauge_code status next_calibration_date department custodian_id')
        .populate('custodian_id', 'FirstName LastName EmployeeID')
        .sort({ next_calibration_date: 1 })
        .skip(skip)
        .limit(limit),
      GaugeMaster.countDocuments(filter),
    ]);

    const transformedGauges = gauges.map(gauge => {
      const gaugeObj = gauge.toObject();
      if (gaugeObj.custodian_id && gaugeObj.custodian_id.FirstName) {
        gaugeObj.custodian_id = {
          _id: gaugeObj.custodian_id._id,
          name: `${gaugeObj.custodian_id.FirstName} ${gaugeObj.custodian_id.LastName || ''}`.trim(),
          employee_code: gaugeObj.custodian_id.EmployeeID,
        };
      }
      return gaugeObj;
    });

    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      count: transformedGauges.length,
      total,
      data: transformedGauges,
      days_lookahead: days,
      as_on_date: today.toISOString().split('T')[0],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// RECORD CALIBRATION EVENT
// ======================================================
const recordCalibration = async (req, res) => {
  try {
    const gauge = await GaugeMaster.findById(req.params.id);
    if (!gauge) {
      return res.status(404).json({ success: false, message: 'Gauge not found' });
    }

    if (gauge.status === 'Condemned') {
      return res.status(400).json({ success: false, message: 'Cannot calibrate a condemned gauge' });
    }

    const {
      calibration_date, calibration_type, calibrating_agency,
      certificate_no, certificate_path, found_condition,
      adjustment_made, adjustment_details, calibrated_by, traceability,
    } = req.body;

    if (!calibration_date || !certificate_no || !certificate_path) {
      return res.status(400).json({
        success: false,
        message: 'calibration_date, certificate_no and certificate_path are required',
      });
    }

    const base = new Date(calibration_date);
    base.setDate(base.getDate() + gauge.calibration_frequency_days);
    const next_calibration_date = base;

    gauge.calibration_records.push({
      calibration_date: new Date(calibration_date),
      calibration_type,
      calibrating_agency,
      certificate_no,
      certificate_path,
      found_condition,
      adjustment_made: adjustment_made || false,
      adjustment_details,
      next_calibration_date,
      calibrated_by,
      traceability,
    });

    gauge.last_calibration_date = new Date(calibration_date);
    gauge.next_calibration_date = next_calibration_date;
    gauge.status = 'Calibrated';

    await gauge.save();
    return res.json({
      success: true,
      message: 'Calibration recorded successfully',
      data: gauge,
      next_calibration_date,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// UPDATE GAUGE
// ======================================================
const updateGauge = async (req, res) => {
  try {
    const allowedFields = [
      'location', 'department', 'custodian_id', 'status',
      'msa_result', 'msa_grr_pct', 'msa_last_done',
      'gage_r_and_r_percent', 'bias', 'linearity', 'is_active',
    ];

    if (req.body.status === 'Calibrated') {
      return res.status(400).json({
        success: false,
        message: 'Status cannot be set to Calibrated manually. Use the calibration endpoint.',
      });
    }

    const update = {};
    allowedFields.forEach(k => {
      if (req.body[k] !== undefined) update[k] = req.body[k];
    });

    const gauge = await GaugeMaster.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!gauge) {
      return res.status(404).json({ success: false, message: 'Gauge not found' });
    }
    return res.json({ success: true, data: gauge });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// GET CALIBRATION HISTORY
// ======================================================
const getCalibrationHistory = async (req, res) => {
  try {
    const gauge = await GaugeMaster.findById(req.params.id)
      .select('gauge_id gauge_name gauge_code calibration_records')
      .populate('calibration_records.calibrated_by', 'FirstName LastName EmployeeID');

    if (!gauge) {
      return res.status(404).json({ success: false, message: 'Gauge not found' });
    }

    const gaugeObj = gauge.toObject();
    if (gaugeObj.calibration_records && gaugeObj.calibration_records.length > 0) {
      gaugeObj.calibration_records = gaugeObj.calibration_records.map(record => {
        if (record.calibrated_by && record.calibrated_by.FirstName) {
          record.calibrated_by = {
            _id: record.calibrated_by._id,
            name: `${record.calibrated_by.FirstName} ${record.calibrated_by.LastName || ''}`.trim(),
            employee_code: record.calibrated_by.EmployeeID,
          };
        }
        return record;
      });
    }

    return res.json({
      success: true,
      data: {
        gauge_id: gaugeObj.gauge_id,
        gauge_name: gaugeObj.gauge_name,
        gauge_code: gaugeObj.gauge_code,
        calibration_history: gaugeObj.calibration_records.sort(
          (a, b) => new Date(b.calibration_date) - new Date(a.calibration_date)
        ),
        total_calibrations: gaugeObj.calibration_records.length,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  registerGauge,
  getAllGauges,
  getGaugeById,
  getCalibrationDue,
  recordCalibration,
  updateGauge,
  getCalibrationHistory,
};