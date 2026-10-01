// const PDFDocument = require("pdfkit");
// const fs = require("fs");
// const path = require("path");

// exports.generateCertificatePDF = (training) => {

//     const fileName = `certificate_${training._id}.pdf`;

//     const filePath = path.join(__dirname, "../uploads/certificates", fileName);

//     const doc = new PDFDocument({
//         size: "A4",
//         layout: "landscape",
//         margin: 50
//     });

//     doc.pipe(fs.createWriteStream(filePath));

//     const pageWidth = doc.page.width;
//     const pageHeight = doc.page.height;

//     /*
//     --------------------------
//     BORDER
//     --------------------------
//     */

//     doc.rect(20, 20, pageWidth - 40, pageHeight - 40)
//         .lineWidth(3)
//         .stroke("#0e7490");

//     /*
//     --------------------------
//     COMPANY LOGO
//     --------------------------
//     */

//     const logoPath = path.join(__dirname, "../templates/logo.png");

//     if (fs.existsSync(logoPath)) {
//         doc.image(logoPath, pageWidth / 2 - 50, 40, { width: 100 });
//     }

//     /*
//     --------------------------
//     TITLE
//     --------------------------
//     */

//     doc.moveDown(4);

//     doc
//         .fontSize(38)
//         .fillColor("#0e7490")
//         .font("Helvetica-Bold")
//         .text("CERTIFICATE OF TRAINING", {
//             align: "center"
//         });

//     /*
//     --------------------------
//     SUBTITLE
//     --------------------------
//     */

//     doc.moveDown(2);

//     doc
//         .fontSize(18)
//         .fillColor("#333")
//         .font("Helvetica")
//         .text("This is to certify that", {
//             align: "center"
//         });

//     /*
//     --------------------------
//     EMPLOYEE NAME
//     --------------------------
//     */

//     doc.moveDown(1);

//     doc
//         .fontSize(28)
//         .fillColor("#000")
//         .font("Helvetica-Bold")
//         .text(training.employeeName || "Employee Name", {
//             align: "center"
//         });

//     /*
//     --------------------------
//     TRAINING NAME
//     --------------------------
//     */

//     doc.moveDown(1.5);

//     doc
//         .fontSize(18)
//         .font("Helvetica")
//         .text(`has successfully completed the training`, {
//             align: "center"
//         });

//     doc.moveDown(1);

//     doc
//         .fontSize(24)
//         .font("Helvetica-Bold")
//         .fillColor("#0e7490")
//         .text(training.trainingName, {
//             align: "center"
//         });

//     /*
//     --------------------------
//     CERTIFICATE DETAILS
//     --------------------------
//     */

//     doc.moveDown(3);

//     doc
//         .fontSize(14)
//         .fillColor("#000")
//         .font("Helvetica")
//         .text(`Certificate Number: ${training.certificateNumber}`, {
//             align: "center"
//         });

//     doc.moveDown(0.5);

//     doc
//         .text(`Issue Date: ${new Date(training.issueDate).toDateString()}`, {
//             align: "center"
//         });

//     /*
//     --------------------------
//     SIGNATURE
//     --------------------------
//     */

//     doc.moveDown(3);

//     const signatureY = pageHeight - 120;

//     doc
//         .fontSize(14)
//         .text("Authorized Signature", pageWidth / 2 - 100, signatureY);

//     doc
//         .moveTo(pageWidth / 2 - 120, signatureY - 10)
//         .lineTo(pageWidth / 2 + 120, signatureY - 10)
//         .stroke();

//     doc.end();

//     return `/uploads/certificates/${fileName}`;
// };const PDFDocument = require("pdfkit");




// const PDFDocument = require("pdfkit");
// const fs = require("fs");
// const path = require("path");

// exports.generateCertificatePDF = (training) => {

//     const fileName = `certificate_${training._id}.pdf`;

//     const filePath = path.join(__dirname, "../uploads/certificates", fileName);

//     const doc = new PDFDocument({
//         size: "A4",
//         layout: "landscape",
//         margin: 50
//     });

//     doc.pipe(fs.createWriteStream(filePath));

//     const pageWidth = doc.page.width;
//     const pageHeight = doc.page.height;

//     const logo = path.join(__dirname, "../templates/logo.png");
//     const signature = path.join(__dirname, "../templates/signature.png");

//     /*
//     --------------------------------
//     OUTER BORDER
//     --------------------------------
//     */

//     doc.rect(20, 20, pageWidth - 40, pageHeight - 40)
//         .lineWidth(4)
//         .stroke("#0f172a");

//     doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
//         .lineWidth(1)
//         .stroke("#94a3b8");

//     /*
//     --------------------------------
//     COMPANY LOGO
//     --------------------------------
//     */

//     if (fs.existsSync(logo)) {
//         doc.image(logo, pageWidth / 2 - 70, 40, { width: 140 });
//     }

//     /*
//     --------------------------------
//     COMPANY NAME
//     --------------------------------
//     */

//     doc.moveDown(4);

//     doc
//         .fontSize(16)
//         .fillColor("#334155")
//         .font("Helvetica-Bold")
//         .text("SUYASH ENTERPRISES", {
//             align: "center"
//         });

//     /*
//     --------------------------------
//     TITLE
//     --------------------------------
//     */

//     doc.moveDown(1);

//     doc
//         .fontSize(36)
//         .fillColor("#0f172a")
//         .font("Helvetica-Bold")
//         .text("CERTIFICATE OF TRAINING", {
//             align: "center"
//         });

//     /*
//     --------------------------------
//     SUB TEXT
//     --------------------------------
//     */

//     doc.moveDown(2);

//     doc
//         .fontSize(16)
//         .font("Helvetica")
//         .fillColor("#374151")
//         .text("This certificate is proudly presented to", {
//             align: "center"
//         });

//     /*
//     --------------------------------
//     EMPLOYEE NAME
//     --------------------------------
//     */

//     doc.moveDown(1);

//     doc
//         .fontSize(30)
//         .fillColor("#111827")
//         .font("Helvetica-Bold")
//         .text(training.employeeName || "Employee Name", {
//             align: "center"
//         });

//     /*
//     --------------------------------
//     TRAINING TEXT
//     --------------------------------
//     */

//     doc.moveDown(1);

//     doc
//         .fontSize(16)
//         .font("Helvetica")
//         .text("for successfully completing the training program", {
//             align: "center"
//         });

//     /*
//     --------------------------------
//     TRAINING NAME
//     --------------------------------
//     */

//     doc.moveDown(1);

//     doc
//         .fontSize(24)
//         .fillColor("#1d4ed8")
//         .font("Helvetica-Bold")
//         .text(training.trainingName, {
//             align: "center"
//         });

//     /*
//     --------------------------------
//     DATE + CERTIFICATE NUMBER
//     --------------------------------
//     */

//     doc.moveDown(2);

//     doc
//         .fontSize(14)
//         .fillColor("#111827")
//         .font("Helvetica")
//         .text(`Certificate Number: ${training.certificateNumber}`, {
//             align: "center"
//         });

//     doc.moveDown(0.5);

//     doc
//         .text(`Issue Date: ${new Date(training.issueDate).toDateString()}`, {
//             align: "center"
//         });

//     /*
//     --------------------------------
//     SIGNATURE
//     --------------------------------
//     */

//     const signatureY = pageHeight - 120;

//     if (fs.existsSync(signature)) {
//         doc.image(signature, pageWidth / 2 - 60, signatureY - 40, { width: 120 });
//     }

//     doc
//         .moveTo(pageWidth / 2 - 120, signatureY)
//         .lineTo(pageWidth / 2 + 120, signatureY)
//         .stroke();

//     doc
//         .fontSize(12)
//         .text("Authorized Signatory", pageWidth / 2 - 70, signatureY + 5);

//     doc.end();

//     return `/uploads/certificates/${fileName}`;
// };const PDFDocument = require("pdfkit");


const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require("path");

exports.generateCertificatePDF = (training) => {

    const fileName = `certificate_${training._id}.pdf`;
    const filePath = path.join(__dirname, "../uploads/certificates", fileName);

    const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 0
    });

    doc.pipe(fs.createWriteStream(filePath));

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    const badge = path.join(__dirname, "../templates/badge.png");

    /*
    ============================
    BACKGROUND
    ============================
    */

    doc.rect(0, 0, pageWidth, pageHeight).fill("#f8fafc");

    /*
    ============================
    DOUBLE BORDER
    ============================
    */

    doc
        .rect(30, 30, pageWidth - 60, pageHeight - 60)
        .lineWidth(3)
        .stroke("#1e3a8a");

    doc
        .rect(45, 45, pageWidth - 90, pageHeight - 90)
        .lineWidth(1)
        .stroke("#38bdf8");

    /*
    ============================
    TOP WAVE
    ============================
    */

    doc
        .save()
        .moveTo(0, 0)
        .lineTo(pageWidth, 0)
        .lineTo(pageWidth, 90)
        .quadraticCurveTo(pageWidth / 2, 150, 0, 90)
        .fill("#1e3a8a");

    doc
        .moveTo(0, 80)
        .quadraticCurveTo(pageWidth / 2, 140, pageWidth, 80)
        .lineWidth(4)
        .stroke("#2dd4bf");

    /*
    ============================
    BOTTOM WAVE
    ============================
    */

    doc
        .save()
        .moveTo(0, pageHeight)
        .lineTo(pageWidth, pageHeight)
        .lineTo(pageWidth, pageHeight - 90)
        .quadraticCurveTo(pageWidth / 2, pageHeight - 150, 0, pageHeight - 90)
        .fill("#1e3a8a");

    doc
        .moveTo(0, pageHeight - 80)
        .quadraticCurveTo(pageWidth / 2, pageHeight - 140, pageWidth, pageHeight - 80)
        .lineWidth(4)
        .stroke("#2dd4bf");

    /*
    ============================
    TITLE
    ============================
    */

    doc
        .font("Helvetica-Bold")
        .fontSize(42)
        .fillColor("#1e3a8a")
        .text("CERTIFICATE OF COMPLETION", 0, 140, {
            align: "center"
        });

    /*
    ============================
    SUBTEXT
    ============================
    */

    doc
        .fontSize(18)
        .fillColor("#334155")
        .font("Helvetica")
        .text("This is presented to:", 0, 220, {
            align: "center"
        });

    /*
    ============================
    EMPLOYEE NAME
    ============================
    */

    doc
        .font("Helvetica-Bold")
        .fontSize(50)
        .fillColor("#0f172a")
        .text(training.employeeName || "Employee Name", 0, 260, {
            align: "center"
        });

    /*
    UNDERLINE
    */

    doc
        .moveTo(pageWidth / 2 - 220, 330)
        .lineTo(pageWidth / 2 + 220, 330)
        .lineWidth(2)
        .stroke("#2dd4bf");

    /*
    ============================
    DESCRIPTION
    ============================
    */

    doc
        .fontSize(18)
        .fillColor("#334155")
        .text(
            `for successfully completing the training program`,
            0,
            360, { align: "center" }
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(24)
        .fillColor("#2563eb")
        .text(training.trainingName, 0, 400, {
            align: "center"
        });

    /*
    ============================
    BADGE
    ============================
    */

    if (fs.existsSync(badge)) {
        doc.image(badge, pageWidth / 2 - 40, 450, { width: 80 });
    }

    /*
    ============================
    SIGNATURE LINES
    ============================
    */

    const signY = pageHeight - 140;

    doc
        .moveTo(pageWidth / 4 - 100, signY)
        .lineTo(pageWidth / 4 + 100, signY)
        .stroke();

    doc
        .fontSize(14)
        .text("Training Manager", pageWidth / 4 - 50, signY + 10);

    doc
        .moveTo((pageWidth / 4) * 3 - 100, signY)
        .lineTo((pageWidth / 4) * 3 + 100, signY)
        .stroke();

    doc
        .fontSize(14)
        .text("HR Manager", (pageWidth / 4) * 3 - 30, signY + 10);

    /*
    ============================
    CERTIFICATE DETAILS
    ============================
    */

    doc
        .fontSize(12)
        .fillColor("#111827")
        .text(
            `Certificate Number: ${training.certificateNumber}`,
            pageWidth / 2 - 120,
            pageHeight - 60
        );

    doc
        .text(
            `Issue Date: ${new Date(training.issueDate).toDateString()}`,
            pageWidth / 2 - 120,
            pageHeight - 40
        );

    doc.end();

    return `/uploads/certificates/${fileName}`;
};