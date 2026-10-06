'use strict';
const fs = require('fs');
const QualityCertificate = require('../../models/Quality/QualityCertificate');
const { generateQualityCertificate } = require('../../services/Quality/pdfGenerator');
const InspectionRecord = require('../../models/Quality/InspectionRecord');
const WorkOrder  = require('../../models/Production/WorkOrder').WorkOrder;
const Customer   = require('../../models/CRM/Customer');

// ── Company config (adjust to pull from Settings model if available) ──────────
const COMPANY_DATA = {
  name:    process.env.COMPANY_NAME    || 'MECH·ERP Manufacturing Pvt Ltd',
  address: process.env.COMPANY_ADDRESS || 'Plot No. 123, Industrial Area, Pune - 411001',
  gst:     process.env.COMPANY_GST     || '27AAECM1234G1Z',
};

// ======================================================
// GENERATE QUALITY CERTIFICATE
// POST /api/quality-certificates
// ======================================================
exports.generateCertificate = async (req, res) => {
  try {
    const {
      cert_type, so_id, dc_id,
      wo_id, final_inspection_id,
      customer_po_number, lot_no,
      material_grade, heat_no, mill_cert_ref, batch_no, declaration,
    } = req.body;

    if (!wo_id || !final_inspection_id) {
      return res.status(400).json({
        success: false,
        message: 'wo_id and final_inspection_id are required',
      });
    }

    // Validate Work Order
    const workOrder = await WorkOrder.findById(wo_id)
      .populate('item_id')
      .populate('customer_id');

    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }

    // Validate Final Inspection — must exist and be Accepted
    const inspection = await InspectionRecord.findById(final_inspection_id);
    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection record not found' });
    }
    if (inspection.overall_result !== 'Accepted') {
      return res.status(400).json({
        success: false,
        message: `Cannot generate certificate: Final inspection result is "${inspection.overall_result}", must be "Accepted"`,
      });
    }

    // Customer details
    const customer = await Customer.findById(workOrder.customer_id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Build actual_values from checkpoint_results  ← FIX: was inspection.results
    const actualValues = (inspection.checkpoint_results || []).map(r => ({
      checkpoint_seq:  r.checkpoint_seq,
      characteristic:  r.characteristic,
      specification:   r.specification,
      nominal:         r.nominal,
      usl:             r.usl,
      lsl:             r.lsl,
      actual_readings: r.readings,
      measured_value:  r.average_reading,
      result:          r.result === 'Pass' ? 'Pass' : 'Fail',
    }));

    // Auto-generate lot_no if not provided
    const now = new Date();
    const autoLotNo = `LOT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

    const certificate = new QualityCertificate({
      cert_type:           cert_type || 'Certificate of Conformance',
      issue_date:          new Date(),
      so_id:               so_id  || null,
      dc_id:               dc_id  || null,
      wo_id,
      final_inspection_id,
      item_id:             workOrder.item_id._id,
      part_no:             workOrder.part_no,
      part_name:           workOrder.item_id?.part_name      || '',
      drawing_no:          workOrder.drawing_no              || '',
      drawing_revision:    workOrder.drawing_revision        || '',
      customer_id:         customer._id,
      customer_name:       customer.customer_name,
      customer_po_number:  customer_po_number || '',
      lot_no:              lot_no || autoLotNo,
       quantity:            inspection.accepted_qty || workOrder.completed_qty || inspection.lot_size,
      unit:                workOrder.item_id?.unit || 'Nos',
      actual_values:       actualValues,
      material_grade:      material_grade  || '',
      heat_no:             heat_no         || '',
      mill_cert_ref:       mill_cert_ref   || '',
      batch_no:            batch_no        || '',
      declaration:         declaration     ||
        'We hereby certify that the above goods have been manufactured and inspected in accordance with the requirements and are found to be in conformance.',
      authorised_by:       req.user._id,
      authorised_by_name:  req.user.Username || '',
      created_by:          req.user._id,
      updated_by:          req.user._id,
    });

    await certificate.save();

    // Generate PDF — pass checkpoint_results directly for the PDF function
    const { filePath, filename } = await generateQualityCertificate(
      certificate.toObject(),
      inspection.toObject(),
      COMPANY_DATA,
    );

    certificate.certificate_path = filePath;
    await certificate.save();

    return res.status(201).json({
      success: true,
      message: 'Quality certificate generated successfully',
      data: {
        _id:              certificate._id,
        cert_id:          certificate.cert_id,
        certificate_path: filePath,
        download_url:     `/api/quality-certificates/${certificate._id}/download`,
      },
    });

  } catch (error) {
    console.error('Generate certificate error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET ALL CERTIFICATES  (with filters)
// GET /api/quality-certificates
// ======================================================
exports.getAllCertificates = async (req, res) => {
  try {
    const { wo_id, so_id, dc_id, customer_id, sent_to_customer, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (wo_id)            filter.wo_id            = wo_id;
    if (so_id)            filter.so_id            = so_id;
    if (dc_id)            filter.dc_id            = dc_id;
    if (customer_id)      filter.customer_id      = customer_id;
    if (sent_to_customer !== undefined) filter.sent_to_customer = sent_to_customer === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [certs, total] = await Promise.all([
      QualityCertificate.find(filter)
        .sort({ issue_date: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('item_id',     'part_no part_name')
        .populate('customer_id', 'customer_name customer_code')
        .populate('authorised_by', 'Username Email'),
      QualityCertificate.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: certs,
      pagination: {
        page:  parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });

  } catch (error) {
    console.error('Get all certificates error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET CERTIFICATE BY ID
// GET /api/quality-certificates/:id
// ======================================================
exports.getCertificate = async (req, res) => {
  try {
    const certificate = await QualityCertificate.findById(req.params.id)
      .populate('item_id',     'part_no part_name')
      .populate('customer_id', 'customer_name customer_code')
      .populate('authorised_by', 'Username Email')
      .populate('created_by',    'Username Email');

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    return res.status(200).json({ success: true, data: certificate });

  } catch (error) {
    console.error('Get certificate error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET CERTIFICATES BY WORK ORDER
// GET /api/quality-certificates/by-wo/:wo_id
// ======================================================
exports.getCertificateByWO = async (req, res) => {
  try {
    const certificates = await QualityCertificate.find({ wo_id: req.params.wo_id })
      .sort({ issue_date: -1 })
      .populate('authorised_by', 'Username Email');

    return res.status(200).json({ success: true, data: certificates });

  } catch (error) {
    console.error('Get certificate by WO error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// DOWNLOAD CERTIFICATE PDF
// GET /api/quality-certificates/:id/download
// ======================================================
exports.downloadCertificate = async (req, res) => {
  try {
    const certificate = await QualityCertificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    if (!certificate.certificate_path || !fs.existsSync(certificate.certificate_path)) {
      return res.status(404).json({ success: false, message: 'Certificate PDF file not found on disk' });
    }

    return res.download(certificate.certificate_path, `${certificate.cert_id}.pdf`);

  } catch (error) {
    console.error('Download certificate error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// MARK CERTIFICATE AS SENT TO CUSTOMER
// PUT /api/quality-certificates/:id/mark-sent
// ======================================================
exports.markAsSent = async (req, res) => {
  try {
    const certificate = await QualityCertificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    certificate.sent_to_customer = true;
    certificate.sent_at          = new Date();
    certificate.sent_by          = req.user._id;
    certificate.updated_by       = req.user._id;

    await certificate.save();

    return res.status(200).json({
      success: true,
      message: 'Certificate marked as sent to customer',
      data: { cert_id: certificate.cert_id, sent_at: certificate.sent_at },
    });

  } catch (error) {
    console.error('Mark as sent error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
// ======================================================
// DELETE QUALITY CERTIFICATE
// DELETE /api/quality-certificates/:id
// ======================================================
exports.deleteCertificate = async (req, res) => {
  try {
    const certificate = await QualityCertificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Delete PDF file if it exists
    if (
      certificate.certificate_path &&
      fs.existsSync(certificate.certificate_path)
    ) {
      fs.unlinkSync(certificate.certificate_path);
    }

    await QualityCertificate.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Quality certificate deleted successfully'
    });

  } catch (error) {
    console.error('Delete certificate error:', error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};