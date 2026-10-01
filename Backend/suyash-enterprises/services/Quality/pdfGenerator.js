'use strict';
const fs   = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

/**
 * Generate Quality Certificate PDF
 *
 * @param {Object} certificateData  - QualityCertificate document (plain object)
 * @param {Object} inspectionData   - InspectionRecord document (plain object)
 * @param {Object} companyData      - { name, address, gst }
 * @returns {Promise<{ filePath, filename }>}
 */
async function generateQualityCertificate(certificateData, inspectionData, companyData) {
  return new Promise((resolve, reject) => {
    try {
      const doc      = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
      const filename = `QCERT_${certificateData.cert_id}_${Date.now()}.pdf`;
      const outDir   = path.join(__dirname, '../../uploads/quality-certificates');
      const filePath = path.join(outDir, filename);

      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const startX = 50;

      // ── Header ─────────────────────────────────────────────────────────────
      doc.fontSize(18).font('Helvetica-Bold')
        .text(companyData.name || 'MECH·ERP', { align: 'center' });
      doc.fontSize(9).font('Helvetica')
        .text(companyData.address || '', { align: 'center' })
        .text(`GST: ${companyData.gst || ''}`, { align: 'center' });

      doc.moveTo(startX, doc.y + 4).lineTo(550, doc.y + 4).stroke();
      doc.moveDown(0.5);

      // ── Title ──────────────────────────────────────────────────────────────
      doc.fontSize(14).font('Helvetica-Bold')
        .text(certificateData.cert_type || 'Certificate of Conformance', { align: 'center' });
      doc.moveDown(0.5);

      // ── Cert No / Date  (right-aligned block) ──────────────────────────────
      doc.fontSize(9).font('Helvetica')
        .text(`Certificate No: ${certificateData.cert_id}`,
              { align: 'right' })
        .text(`Issue Date: ${new Date(certificateData.issue_date).toLocaleDateString('en-IN')}`,
              { align: 'right' });
      doc.moveDown(0.5);

      // ── To / Customer ──────────────────────────────────────────────────────
      doc.fontSize(10).font('Helvetica-Bold').text('TO,');
      doc.fontSize(9).font('Helvetica')
        .text(certificateData.customer_name || '')
        .text(`PO No: ${certificateData.customer_po_number || 'N/A'}`);
      doc.moveDown(0.5);

      // ── Subject ────────────────────────────────────────────────────────────
      doc.fontSize(9).font('Helvetica-Bold')
        .text(`SUBJECT: ${certificateData.cert_type.toUpperCase()} FOR ${certificateData.part_no} — ${certificateData.part_name}`);
      doc.moveDown(0.5);

      // ── Declaration ────────────────────────────────────────────────────────
      doc.fontSize(9).font('Helvetica').text(certificateData.declaration || '');
      doc.moveDown();

      // ── Product Details table ──────────────────────────────────────────────
      doc.fontSize(10).font('Helvetica-Bold').text('PRODUCT DETAILS:', { underline: true });
      doc.moveDown(0.3);

      const rows = [
        ['Part Number',    certificateData.part_no,          'PASS', 'As per drawing'],
        ['Part Name',      certificateData.part_name,        'PASS', 'As per specification'],
        ['Drawing No.',    certificateData.drawing_no || '-', 'PASS', `Rev ${certificateData.drawing_revision || '-'}`],
        ['Quantity',       `${certificateData.quantity} ${certificateData.unit}`, 'PASS', `Lot: ${certificateData.lot_no}`],
        ['Batch / Heat No.', certificateData.heat_no || certificateData.batch_no || 'N/A', 'PASS', 'Traceable'],
      ];

      _drawTable(doc, startX, ['Description', 'Specification / Value', 'Result', 'Remarks'], rows, [150, 150, 60, 140]);
      doc.moveDown(0.5);

      // ── Test Results (from checkpoint_results)  ← FIX: was inspection.results ──
      const checkpoints = inspectionData.checkpoint_results || certificateData.actual_values || [];
      if (checkpoints.length > 0) {
        doc.fontSize(10).font('Helvetica-Bold').text('TEST RESULTS:', { underline: true });
        doc.moveDown(0.3);

        const testRows = checkpoints.slice(0, 15).map(v => {
          let spec = '';
          if (v.nominal != null) spec += `${v.nominal}`;
          if (v.usl != null && v.lsl != null) spec += ` (${v.lsl}–${v.usl})`;

          const readings = (v.readings || v.actual_readings || []);
          const measured  = readings.length
            ? readings.map(r => Number(r.toFixed(3)).toString()).join(', ')
            : (v.average_reading != null ? String(v.average_reading) : 'N/A');

          return [
            (v.characteristic || '').substring(0, 28),
            spec.substring(0, 22),
            measured.substring(0, 22),
            v.result || '—',
          ];
        });

        _drawTable(doc, startX, ['Characteristic', 'Specification', 'Measured Value', 'Result'], testRows, [160, 110, 130, 60]);
        doc.moveDown(0.5);
      }

      // ── Material Traceability ──────────────────────────────────────────────
      if (certificateData.material_grade || certificateData.heat_no || certificateData.mill_cert_ref) {
        doc.fontSize(10).font('Helvetica-Bold').text('MATERIAL TRACEABILITY:', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(9).font('Helvetica');
        if (certificateData.material_grade) doc.text(`Material Grade: ${certificateData.material_grade}`);
        if (certificateData.heat_no)        doc.text(`Heat Number: ${certificateData.heat_no}`);
        if (certificateData.mill_cert_ref)  doc.text(`Mill Certificate Ref: ${certificateData.mill_cert_ref}`);
        doc.moveDown();
      }

      // ── Signature block ────────────────────────────────────────────────────
      doc.moveDown();
      const sigY = doc.y;
      doc.fontSize(9).font('Helvetica')
        .text('For ' + (companyData.name || ''), startX + 330, sigY)
        .text('', startX + 330, sigY + 25)  // signature space
        .text('Authorised Signatory (QA)', startX + 330, sigY + 40)
        .text(certificateData.authorised_by_name || '', startX + 330, sigY + 52)
        .text(new Date(certificateData.issue_date).toLocaleDateString('en-IN'), startX + 330, sigY + 64);

      // ── Footer on every page ───────────────────────────────────────────────
      const pageRange = doc.bufferedPageRange();
      for (let i = 0; i < pageRange.count; i++) {
        doc.switchToPage(pageRange.start + i);
        doc.fontSize(7).fillColor('#888888')
          .text(
            `Generated on ${new Date().toLocaleString('en-IN')}  |  System Generated Certificate  |  Page ${i + 1} of ${pageRange.count}`,
            startX, doc.page.height - 40, { align: 'center', width: 500 },
          );
        doc.fillColor('#000000');
      }

      doc.end();

      stream.on('finish', () => resolve({ filePath, filename }));
      stream.on('error',  reject);

    } catch (err) {
      reject(err);
    }
  });
}

// ── Internal helper: draw a simple bordered table ────────────────────────────
function _drawTable(doc, x, headers, rows, colWidths) {
  const rowH   = 16;
  const totalW = colWidths.reduce((a, b) => a + b, 0);

  // Header row
  let cx = x;
  doc.rect(x, doc.y, totalW, rowH).stroke();
  doc.fontSize(8).font('Helvetica-Bold');
  headers.forEach((h, i) => {
    doc.text(h, cx + 3, doc.y + 3, { width: colWidths[i] - 6, lineBreak: false });
    if (i < headers.length - 1) {
      doc.moveTo(cx + colWidths[i], doc.y - 3).lineTo(cx + colWidths[i], doc.y + rowH - 3).stroke();
    }
    cx += colWidths[i];
  });

  doc.font('Helvetica').fontSize(8);

  // Data rows
  for (const row of rows) {
    doc.moveDown(rowH / doc.currentLineHeight());
    cx = x;
    const startY = doc.y;
    doc.rect(x, startY, totalW, rowH).stroke();
    row.forEach((cell, i) => {
      doc.text(String(cell ?? ''), cx + 3, startY + 3, { width: colWidths[i] - 6, lineBreak: false });
      if (i < row.length - 1) {
        doc.moveTo(cx + colWidths[i], startY).lineTo(cx + colWidths[i], startY + rowH).stroke();
      }
      cx += colWidths[i];
    });
  }

  doc.moveDown(0.5);
}

module.exports = { generateQualityCertificate };
