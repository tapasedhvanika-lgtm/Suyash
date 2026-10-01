// const mongoose = require("mongoose");
// const Training = require("../models/Training");
// const EmployeeTrainingRecord = require("../models/EmployeeTrainingRecord");
// const { generateCertificateNumber } = require("../utils/generateCertificate");
// const { generateCertificatePDF } = require("../utils/generateCertificatePDF");

// /*
// -----------------------------------------
// Assign Training to Employees
// -----------------------------------------
// */

// exports.assignTraining = async(req, res) => {
//     try {

//         const { trainingId, employeeIds } = req.body;

//         // Validate request
//         if (!trainingId || !employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Training ID and employee IDs are required"
//             });
//         }

//         // Validate training ID
//         if (!mongoose.Types.ObjectId.isValid(trainingId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid training ID format"
//             });
//         }

//         // Validate employee IDs
//         for (const empId of employeeIds) {
//             if (!mongoose.Types.ObjectId.isValid(empId)) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Invalid employee ID format"
//                 });
//             }
//         }

//         const training = await Training.findById(trainingId);

//         if (!training) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Training not found"
//             });
//         }

//         const assignedRecords = [];

//         for (const empId of employeeIds) {

//             const record = new EmployeeTrainingRecord({
//                 training: training._id,
//                 employee: empId,

//                 trainingName: training.trainingName,
//                 trainer: training.provider,

//                 startDate: training.startDate,
//                 endDate: training.endDate,

//                 expiryDate: training.expiryDate ||
//                     new Date(new Date().setFullYear(new Date().getFullYear() + 1)),

//                 status: "Pending"
//             });

//             const savedRecord = await record.save();

//             assignedRecords.push(savedRecord);
//         }

//         res.status(200).json({
//             success: true,
//             message: "Training assigned successfully",
//             data: assignedRecords
//         });

//     } catch (error) {

//         res.status(500).json({
//             success: false,
//             message: error.message
//         });

//     }
// };

// /*
// -----------------------------------------
// Complete Training
// -----------------------------------------
// */

// exports.completeTraining = async(req, res) => {

//     try {

//         const { recordId, score } = req.body;

//         if (!mongoose.Types.ObjectId.isValid(recordId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid record ID"
//             });
//         }

//         const record = await EmployeeTrainingRecord.findById(recordId)
//             .populate("employee")
//             .populate("training");

//         if (!record) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Training record not found"
//             });
//         }

//         record.status = "Completed";
//         record.score = score;

//         record.certificateNumber = generateCertificateNumber();

//         record.issueDate = new Date();

//         const expiry = new Date();
//         expiry.setFullYear(expiry.getFullYear() + 1);

//         record.expiryDate = expiry;

//         record.certificateStatus = "Valid";

//         const filePath = generateCertificatePDF(record);

//         record.certificateFile = filePath;

//         await record.save();

//         res.json({
//             success: true,
//             message: "Training completed and certificate generated",
//             data: record
//         });

//     } catch (error) {

//         res.status(500).json({
//             success: false,
//             message: error.message
//         });

//     }

// };

// /*
// -----------------------------------------
// Employee Training History
// -----------------------------------------
// */

// exports.getEmployeeTrainings = async(req, res) => {

//     try {

//         if (!mongoose.Types.ObjectId.isValid(req.params.employeeId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid employee ID"
//             });
//         }

//         const trainings = await EmployeeTrainingRecord
//             .find({ employee: req.params.employeeId })
//             .populate("training");

//         res.json({
//             success: true,
//             data: trainings
//         });

//     } catch (error) {

//         res.status(500).json({
//             success: false,
//             message: error.message
//         });

//     }

// };

// /*
// -----------------------------------------
// Get Expiring Certificates
// -----------------------------------------
// */

// exports.getExpiringCertificates = async(req, res) => {

//     try {

//         const today = new Date();

//         const nextMonth = new Date();
//         nextMonth.setDate(nextMonth.getDate() + 30);

//         const records = await EmployeeTrainingRecord.find({
//             expiryDate: {
//                 $gte: today,
//                 $lte: nextMonth
//             }
//         }).populate("employee training");

//         res.json({
//             success: true,
//             data: records
//         });

//     } catch (error) {

//         res.status(500).json({
//             success: false,
//             message: error.message
//         });

//     }

// };

// exports.getAllRecords = async(req, res) => {
//     try {
//         const records = await EmployeeTrainingRecord.find()
//             .populate("employee")
//             .populate("training")
//             .sort({ createdAt: -1 });

//         res.status(200).json({
//             success: true,
//             count: records.length,
//             data: records
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// const mongoose = require("mongoose");
// const Training = require("../models/Training");
// const EmployeeTrainingRecord = require("../models/HRTrainingRecord");
// const { generateCertificateNumber } = require("../utils/generateCertificate");
// const { generateCertificatePDF } = require("../utils/generateCertificatePDF");

// /*
// -----------------------------------------
// Assign Training to Employees
// -----------------------------------------
// */

// exports.assignTraining = async(req, res) => {
//     try {
//         const { trainingId, employeeIds } = req.body;

//         if (!trainingId || !employeeIds || employeeIds.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Training ID and employee IDs are required",
//             });
//         }

//         if (!mongoose.Types.ObjectId.isValid(trainingId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid training ID",
//             });
//         }

//         const training = await Training.findById(trainingId);

//         if (!training) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Training not found",
//             });
//         }

//         const assignedRecords = [];

//         for (const empId of employeeIds) {
//             const exists = await EmployeeTrainingRecord.findOne({
//                 training: trainingId,
//                 employee: empId,
//             });

//             if (exists) continue;

//             const record = new EmployeeTrainingRecord({
//                 training: training._id,
//                 employee: empId,
//                 trainingName: training.trainingName,
//                 trainer: training.provider,
//                 startDate: training.startDate,
//                 endDate: training.endDate,
//                 expiryDate: training.expiryDate ||
//                     new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
//                 status: "Assigned",
//             });

//             const savedRecord = await record.save();
//             assignedRecords.push(savedRecord);
//         }

//         res.status(200).json({
//             success: true,
//             message: "Training assigned successfully",
//             data: assignedRecords,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// /*
// -----------------------------------------
// Complete Training
// -----------------------------------------
// */

// exports.completeTraining = async(req, res) => {
//     try {
//         const { recordId, score } = req.body;

//         if (!mongoose.Types.ObjectId.isValid(recordId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid record ID",
//             });
//         }

//         const record = await EmployeeTrainingRecord.findById(recordId)
//             .populate("employee")
//             .populate("training");

//         if (!record) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Training record not found",
//             });
//         }

//         record.status = "Completed";
//         record.score = score;

//         record.certificateNumber = generateCertificateNumber();
//         record.issueDate = new Date();

//         const expiry = new Date();
//         expiry.setFullYear(expiry.getFullYear() + 1);
//         record.expiryDate = expiry;

//         record.certificateStatus = "Valid";

//         record.employeeName = `${record.employee?.firstName || ""} ${record.employee?.lastName || ""}`;

//         const filePath = generateCertificatePDF(record);
//         record.certificateFile = filePath;

//         await record.save();

//         res.json({
//             success: true,
//             message: "Training completed and certificate generated",
//             data: record,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// /*
// -----------------------------------------
// GET ASSIGNED TRAININGS
// -----------------------------------------
// */

// const records = await EmployeeTrainingRecord.find()
//     .populate("employee") // ✅ VERY IMPORTANT
//     .populate("training")
//     .sort({ createdAt: -1 });

// const formatted = records.map((r) => ({
//     _id: r._id,

//     employeeName: r.employee &&
//         (r.employee.firstName || r.employee.name) ?
//         (r.employee.firstName || r.employee.name) +
//         " " +
//         (r.employee.lastName || "") : "N/A",

//     trainingName: r.trainingName ||
//         (r.training && r.training.trainingName) ||
//         "",

//     startDate: r.startDate ?
//         new Date(r.startDate).toLocaleDateString() : "",

//     endDate: r.endDate ?
//         new Date(r.endDate).toLocaleDateString() : "",

//     status: r.status || "",

//     certificateFile: r.certificateFile || ""
// }));

// /*
// -----------------------------------------
// Employee Training History
// -----------------------------------------
// */

// exports.getEmployeeTrainings = async(req, res) => {
//     try {
//         if (!mongoose.Types.ObjectId.isValid(req.params.employeeId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid employee ID",
//             });
//         }

//         const trainings = await EmployeeTrainingRecord.find({
//             employee: req.params.employeeId,
//         }).populate("training");

//         res.json({
//             success: true,
//             data: trainings,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// /*
// -----------------------------------------
// Get Expiring Certificates
// -----------------------------------------
// */

// exports.getExpiringCertificates = async(req, res) => {
//     try {
//         const today = new Date();
//         const nextMonth = new Date();
//         nextMonth.setDate(nextMonth.getDate() + 30);

//         const records = await EmployeeTrainingRecord.find({
//             expiryDate: { $gte: today, $lte: nextMonth },
//         }).populate("employee training");

//         res.json({
//             success: true,
//             data: records,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// /*
// -----------------------------------------
// Get All Records (Admin)
// -----------------------------------------
// */

// exports.getAllRecords = async(req, res) => {
//     try {
//         const records = await EmployeeTrainingRecord.find()
//             .populate("employee")
//             .populate("training")
//             .sort({ createdAt: -1 });

//         res.status(200).json({
//             success: true,
//             count: records.length,
//             data: records,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// const mongoose = require("mongoose");
// const Training = require("../models/Training");
// const EmployeeTrainingRecord = require("../models/HRTrainingRecord");
// const { generateCertificateNumber } = require("../utils/generateCertificate");
// const { generateCertificatePDF } = require("../utils/generateCertificatePDF");

// /*
// -----------------------------------------
// Assign Training
// -----------------------------------------
// */
// exports.assignTraining = async(req, res) => {
//     try {
//         const { trainingId, employeeIds } = req.body;

//         if (!trainingId || !employeeIds || employeeIds.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Training ID and employee IDs are required",
//             });
//         }

//         const training = await Training.findById(trainingId);

//         if (!training) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Training not found",
//             });
//         }

//         const assignedRecords = [];

//         for (const empId of employeeIds) {
//             const exists = await EmployeeTrainingRecord.findOne({
//                 training: trainingId,
//                 employee: empId,
//             });

//             if (exists) continue;

//             const record = new EmployeeTrainingRecord({
//                 training: training._id,
//                 employee: empId,
//                 trainingName: training.trainingName,
//                 trainer: training.provider,
//                 startDate: training.startDate,
//                 endDate: training.endDate,
//                 expiryDate: training.expiryDate || new Date(),
//                 status: "Assigned",
//             });

//             const savedRecord = await record.save();
//             assignedRecords.push(savedRecord);
//         }

//         res.json({
//             success: true,
//             message: "Training assigned successfully",
//             data: assignedRecords,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// /*
// -----------------------------------------
// Complete Training
// -----------------------------------------
// */
// exports.completeTraining = async(req, res) => {
//     try {
//         const { recordId, score } = req.body;

//         const record = await EmployeeTrainingRecord.findById(recordId)
//             .populate("employee")
//             .populate("training");

//         if (!record) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Record not found",
//             });
//         }

//         record.status = "Completed";
//         record.score = score;

//         record.certificateNumber = generateCertificateNumber();
//         record.issueDate = new Date();

//         const expiry = new Date();
//         expiry.setFullYear(expiry.getFullYear() + 1);
//         record.expiryDate = expiry;

//         record.certificateStatus = "Valid";

//         record.employeeName =
//             (record.employee && record.employee.FirstName ?
//                 record.employee.FirstName :
//                 "") +
//             " " +
//             (record.employee && record.employee.LastName ?
//                 record.employee.LastName :
//                 "");

//         const filePath = generateCertificatePDF(record);
//         record.certificateFile = filePath;

//         await record.save();

//         res.json({
//             success: true,
//             message: "Training completed",
//             data: record,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// /*
// -----------------------------------------
// GET ASSIGNED TRAININGS (🔥 FIXED)
// -----------------------------------------
// */
// exports.getAssignedTrainings = async(req, res) => {
//     try {
//         const records = await EmployeeTrainingRecord.find()
//             .populate("employee")
//             .populate("training")
//             .sort({ createdAt: -1 });

//         const formatted = records.map((r) => ({
//             _id: r._id,

//             employeeName: r.employee && (r.employee.firstName || r.employee.name) ?
//                 (r.employee.firstName || r.employee.name) +
//                 " " +
//                 (r.employee.lastName || "") : "N/A",

//             trainingName: r.trainingName || (r.training && r.training.trainingName) || "",

//             startDate: r.startDate ? new Date(r.startDate).toLocaleDateString() : "",

//             endDate: r.endDate ? new Date(r.endDate).toLocaleDateString() : "",

//             status: r.status || "",
//             certificateFile: r.certificateFile || "",
//         }));

//         res.json({
//             success: true,
//             data: formatted,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// /*
// -----------------------------------------
// Employee Training History
// -----------------------------------------
// */
// exports.getEmployeeTrainings = async(req, res) => {
//     try {
//         const records = await EmployeeTrainingRecord.find({
//             employee: req.params.employeeId,
//         }).populate("training");

//         res.json({
//             success: true,
//             data: records,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// /*
// -----------------------------------------
// Expiring Certificates
// -----------------------------------------
// */
// exports.getExpiringCertificates = async(req, res) => {
//     try {
//         const today = new Date();
//         const nextMonth = new Date();
//         nextMonth.setDate(nextMonth.getDate() + 30);

//         const records = await EmployeeTrainingRecord.find({
//             expiryDate: { $gte: today, $lte: nextMonth },
//         }).populate("employee training");

//         res.json({
//             success: true,
//             data: records,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// /*
// -----------------------------------------
// All Records
// -----------------------------------------
// */
// exports.getAllRecords = async(req, res) => {
//     try {
//         const records = await EmployeeTrainingRecord.find()
//             .populate("employee")
//             .populate("training");

//         res.json({
//             success: true,
//             data: records,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// const mongoose = require("mongoose");
// const Training = require("../models/Training");
// const EmployeeTrainingRecord = require("../models/HRTrainingRecord");
// const { generateCertificateNumber } = require("../utils/generateCertificate");
// const { generateCertificatePDF } = require("../utils/generateCertificatePDF");

// /*
// -----------------------------------------
// Assign Training
// -----------------------------------------
// */
// exports.assignTraining = async(req, res) => {
//     try {
//         const { trainingId, employeeIds } = req.body;

//         if (!trainingId || !employeeIds || employeeIds.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Training ID and employee IDs are required",
//             });
//         }

//         const training = await Training.findById(trainingId);

//         if (!training) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Training not found",
//             });
//         }

//         const assignedRecords = [];

//         for (const empId of employeeIds) {
//             const exists = await EmployeeTrainingRecord.findOne({
//                 training: trainingId,
//                 employee: empId,
//             });

//             if (exists) continue;

//             const record = new EmployeeTrainingRecord({
//                 training: training._id,
//                 employee: empId,
//                 trainingName: training.trainingName,
//                 trainer: training.provider,
//                 startDate: training.startDate,
//                 endDate: training.endDate,
//                 expiryDate: training.expiryDate || new Date(),
//                 status: "Assigned",
//             });

//             const savedRecord = await record.save();
//             assignedRecords.push(savedRecord);
//         }

//         res.json({
//             success: true,
//             message: "Training assigned successfully",
//             data: assignedRecords,
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };


// /*
// -----------------------------------------
// Complete Training
// -----------------------------------------
// */
// exports.completeTraining = async(req, res) => {
//     try {
//         const { recordId, score } = req.body;

//         const record = await EmployeeTrainingRecord.findById(recordId)
//             .populate({
//                 path: "employee",
//                 select: "FirstName LastName",
//             })
//             .populate("training");

//         if (!record) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Record not found",
//             });
//         }

//         record.status = "Completed";
//         record.score = score;

//         record.certificateNumber = generateCertificateNumber();
//         record.issueDate = new Date();

//         const expiry = new Date();
//         expiry.setFullYear(expiry.getFullYear() + 1);
//         record.expiryDate = expiry;

//         record.certificateStatus = "Valid";

//         record.employeeName =
//             (record.employee && record.employee.FirstName ?
//                 record.employee.FirstName :
//                 "") +
//             " " +
//             (record.employee && record.employee.LastName ?
//                 record.employee.LastName :
//                 "");

//         const filePath = generateCertificatePDF(record);
//         record.certificateFile = filePath;

//         await record.save();

//         res.json({
//             success: true,
//             message: "Training completed",
//             data: record,
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };


// /*
// -----------------------------------------
// GET ASSIGNED TRAININGS (🔥 FINAL FIX)
// -----------------------------------------
// */
// exports.getAssignedTrainings = async(req, res) => {
//     try {

//         const records = await EmployeeTrainingRecord.find()
//             .populate({
//                 path: "employee",
//                 select: "FirstName LastName EmployeeID"
//             })
//             .populate("training")
//             .sort({ createdAt: -1 });

//         const formatted = records.map((r) => {

//             // 🔥 SAFE NAME BUILDING
//             let employeeName = "N/A";

//             if (r.employee) {
//                 const fullName = `${r.employee.FirstName || ""} ${r.employee.LastName || ""}`.trim();

//                 employeeName =
//                     fullName !== "" ?
//                     fullName :
//                     r.employee.EmployeeID || "N/A";
//             }

//             return {
//                 _id: r._id,

//                 employeeName,

//                 trainingName: r.trainingName ||
//                     (r.training && r.training.trainingName) ||
//                     "",

//                 startDate: r.startDate ?
//                     new Date(r.startDate).toLocaleDateString() : "",

//                 endDate: r.endDate ?
//                     new Date(r.endDate).toLocaleDateString() : "",

//                 status: r.status || "",
//                 certificateFile: r.certificateFile || "",
//             };
//         });

//         res.json({
//             success: true,
//             data: formatted,
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };


// /*
// -----------------------------------------
// Employee Training History
// -----------------------------------------
// */
// exports.getEmployeeTrainings = async(req, res) => {
//     try {
//         const records = await EmployeeTrainingRecord.find({
//             employee: req.params.employeeId,
//         }).populate("training");

//         res.json({
//             success: true,
//             data: records,
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };


// /*
// -----------------------------------------
// Expiring Certificates
// -----------------------------------------
// */
// exports.getExpiringCertificates = async(req, res) => {
//     try {
//         const today = new Date();
//         const nextMonth = new Date();
//         nextMonth.setDate(nextMonth.getDate() + 30);

//         const records = await EmployeeTrainingRecord.find({
//             expiryDate: { $gte: today, $lte: nextMonth },
//         }).populate("employee training");

//         res.json({
//             success: true,
//             data: records,
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };


// /*
// -----------------------------------------
// All Records
// -----------------------------------------
// */
// exports.getAllRecords = async(req, res) => {
//     try {
//         const records = await EmployeeTrainingRecord.find()
//             .populate("employee")
//             .populate("training");

//         res.json({
//             success: true,
//             data: records,
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };


const mongoose = require("mongoose");
const Training = require("../../models/HR/Training");
const EmployeeTrainingRecord = require("../../models/HR/HRTrainingRecord");
const Employee = require("../../models/HR/Employee");

const { generateCertificateNumber } = require("../../utils/generateCertificate");
const { generateCertificatePDF } = require("../../utils/generateCertificatePDF");

/*
-----------------------------------------
Assign Training
-----------------------------------------
*/
exports.assignTraining = async(req, res) => {
    try {
        const { trainingId, employeeIds } = req.body;

        if (!trainingId || !employeeIds || employeeIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Training ID and employee IDs are required",
            });
        }

        const training = await Training.findById(trainingId);
        if (!training) {
            return res.status(404).json({
                success: false,
                message: "Training not found",
            });
        }

        const assignedRecords = [];
        const skippedRecords = [];

        for (const empId of employeeIds) {
            const exists = await EmployeeTrainingRecord.findOne({
                training: trainingId,
                employee: empId,
            });

            if (exists) {
                skippedRecords.push(empId);
                continue;
            }

            const employee = await Employee.findById(empId);
            if (!employee) {
                skippedRecords.push(empId);
                continue;
            }

            // ✅ FINAL NAME FIX (CORRECT FIELDS)
            const fullName =
                `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
                employee.employeeName ||
                employee.name ||
                employee.employeeCode ||
                "Employee";

            const record = new EmployeeTrainingRecord({
                training: training._id,
                employee: empId,
                trainingName: training.trainingName,
                trainer: training.provider,
                startDate: training.startDate,
                endDate: training.endDate,
                expiryDate: training.expiryDate || new Date(),
                status: "Assigned",
                employeeName: fullName, // ✅ FIXED
            });

            const savedRecord = await record.save();
            assignedRecords.push(savedRecord);
        }

        res.json({
            success: true,
            message: assignedRecords.length > 0 ?
                `Training assigned to ${assignedRecords.length} employee(s)` : "No new assignments were made",
            data: assignedRecords,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


/*
-----------------------------------------
Complete Training
-----------------------------------------
*/
exports.completeTraining = async(req, res) => {
    try {
        const { recordId, score } = req.body;

        const record = await EmployeeTrainingRecord.findById(recordId)
            .populate({
                path: "employee",
                select: "FirstName LastName EmployeeID",
            })
            .populate("training");

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Record not found",
            });
        }

        record.status = "Completed";
        record.score = score;

        record.certificateNumber = generateCertificateNumber();
        record.issueDate = new Date();

        // expiry = 1 year
        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 1);
        record.expiryDate = expiry;

        record.certificateStatus = "Valid";

        // 🔥 SAFE NAME
        if (record.employee) {
            const fullName = `${record.employee.FirstName || ""} ${record.employee.LastName || ""}`.trim();

            record.employeeName =
                fullName !== "" ?
                fullName :
                record.employee.EmployeeID || "Employee";
        } else {
            record.employeeName = "Employee";
        }

        // PDF generate
        const filePath = generateCertificatePDF(record);
        record.certificateFile = filePath;

        await record.save();

        res.json({
            success: true,
            message: "Training completed",
            data: record,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


/*
-----------------------------------------
GET ASSIGNED TRAININGS (FINAL)
-----------------------------------------
*/
// exports.getAssignedTrainings = async(req, res) => {
//     try {
//         const records = await EmployeeTrainingRecord.find()
//             .populate({
//                 path: "employee",
//                 select: "employeeName FirstName LastName EmployeeID",
//             })
//             .populate("training")
//             .sort({ createdAt: -1 });

//         const formatted = records.map((r) => {
//             let employeeName = "N/A";

//             if (r.employee) {
//                 employeeName =
//                     r.employee.employeeName ||
//                     `${r.employee.FirstName || ""} ${r.employee.LastName || ""}`.trim() ||
//                     r.employee.EmployeeID ||
//                     "N/A";
//             }

//             return {
//                 _id: r._id,
//                 employeeName,

//                 trainingName: r.trainingName ||
//                     (r.training && r.training.trainingName) ||
//                     "",

//                 startDate: r.startDate ?
//                     new Date(r.startDate).toLocaleDateString() : "",

//                 endDate: r.endDate ?
//                     new Date(r.endDate).toLocaleDateString() : "",

//                 status: r.status || "",
//                 certificateFile: r.certificateFile || "",
//             };
//         });

//         res.json({
//             success: true,
//             data: formatted,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

exports.getAssignedTrainings = async(req, res) => {
    try {
        const records = await EmployeeTrainingRecord.find()
            .populate({
                path: "employee",
                // ✅ CORRECT FIELDS based on your Employee schema
                select: "EmployeeID FirstName LastName employeeName name employeeCode",
            })
            .populate("training")
            .sort({ createdAt: -1 });

        const formatted = records.map((r) => {
            let employeeName = "N/A";
            let employeeId = "N/A";

            if (r.employee && typeof r.employee === "object") {
                // Map from capitalized field names to what your API expects
                if (r.employee.FirstName || r.employee.LastName) {
                    employeeName = `${r.employee.FirstName || ""} ${r.employee.LastName || ""}`.trim();
                } else if (r.employee.employeeName) {
                    employeeName = r.employee.employeeName;
                } else if (r.employee.name) {
                    employeeName = r.employee.name;
                } else if (r.employee.EmployeeID) {
                    employeeName = r.employee.EmployeeID;
                }
                
                // Get Employee ID
                employeeId = r.employee.EmployeeID || "N/A";
            }

            return {
                _id: r._id,
                employeeId,      // ✅ Added employeeId field
                employeeName,    // ✅ Keep existing employeeName field
                trainingName: r.trainingName ||
                    (r.training && r.training.trainingName) ||
                    "",
                startDate: r.startDate ?
                    new Date(r.startDate).toLocaleDateString() : "",
                endDate: r.endDate ?
                    new Date(r.endDate).toLocaleDateString() : "",
                status: r.status || "",
                certificateFile: r.certificateFile || "",
            };
        });

        res.json({
            success: true,
            data: formatted,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
/*
-----------------------------------------
Employee Training History
-----------------------------------------
*/
exports.getEmployeeTrainings = async(req, res) => {
    try {
        const records = await EmployeeTrainingRecord.find({
            employee: req.params.employeeId,
        }).populate("training");

        res.json({
            success: true,
            data: records,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


/*
-----------------------------------------
Expiring Certificates
-----------------------------------------
*/
exports.getExpiringCertificates = async(req, res) => {
    try {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setDate(today.getDate() + 30);

        const records = await EmployeeTrainingRecord.find({
                expiryDate: { $gte: today, $lte: nextMonth },
            })
            .populate({
                path: "employee",
                select: " employeeName FirstName LastName EmployeeID",
            })
            .populate("training");

        res.json({
            success: true,
            data: records,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


/*
-----------------------------------------
All Records
-----------------------------------------
*/
exports.getAllRecords = async(req, res) => {
    try {
        const records = await EmployeeTrainingRecord.find()
            .populate({
                path: "employee",
                select: "FirstName LastName EmployeeID",
            })
            .populate("training");

        res.json({
            success: true,
            data: records,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};