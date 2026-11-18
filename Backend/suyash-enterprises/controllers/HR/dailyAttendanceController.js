const DailyAttendance = require('../../models/HR/DailyAttendance');
const Employee = require('../../models/HR/Employee'); // ⚠️ तुमच्या Employee मॉडेलचा योग्य पाथ इथे टाका
const ExcelJS = require('exceljs');

// 1. Add Attendance (Check In करण्यासाठी)
exports.addAttendance = async (req, res) => {
    try {
        const { EmployeeID, Date, CheckInTime, CheckOutTime, Status } = req.body;
        
        const newRecord = new DailyAttendance({ 
            EmployeeID, 
            Date: Date || new Date(), 
            CheckInTime, 
            CheckOutTime, 
            Status: Status || 'Present' 
        });
        
        await newRecord.save();
        const populatedRecord = await DailyAttendance.findById(newRecord._id).populate('EmployeeID');
        
        res.status(201).json({ success: true, message: "Attendance marked successfully", data: populatedRecord });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. View All Attendance (All Employees + Latest Attendance + Pagination + Search)
exports.getAllAttendance = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        // Employee पासून सुरुवात करा
        let pipeline = [
            // Employee मध्ये नावावर सर्च फिल्टर लावा
            ...(search ? [{
                $match: {
                    $or: [
                        { FirstName: { $regex: search, $options: 'i' } },
                        { LastName: { $regex: search, $options: 'i' } },
                        { name: { $regex: search, $options: 'i' } },
                        { EmployeeName: { $regex: search, $options: 'i' } }
                    ]
                }
            }] : []),
            
            // प्रत्येक कर्मचाऱ्याची शेवटची ॲटेंडन्स $lookup करून आणा
            {
                $lookup: {
                    from: 'dailyattendances', // ⚠️ तुमच्या DailyAttendance कलेक्शनचे नाव (Mongoose सहसा 'dailyattendances' ठेवते)
                    let: { empId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$EmployeeID', '$$empId'] } } },
                        { $sort: { Date: -1 } }, // शेवटची ॲटेंडन्स आधी
                        { $limit: 1 } // फक्त १ रेकॉर्ड घ्या
                    ],
                    as: 'attendanceData'
                }
            },
            {
                $unwind: {
                    path: '$attendanceData',
                    preserveNullAndEmptyArrays: true // ॲटेंडन्स नसेल तरी कर्मचारी दाखवा
                }
            },
            
            // नावानुसार क्रमवारी लावा
            { $sort: { FirstName: 1 } },

            // Pagination साठी Facet
            {
                $facet: {
                    metadata: [{ $count: 'totalRecords' }],
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: '$_id',
                                EmployeeID: '$$ROOT', // संपूर्ण Employee डेटा पाठवा
                                Date: '$attendanceData.Date',
                                CheckInTime: '$attendanceData.CheckInTime',
                                CheckOutTime: '$attendanceData.CheckOutTime',
                                Status: '$attendanceData.Status',
                                AttendanceId: '$attendanceData._id' // ॲटेंडन्सचा ID (नसेल तर null)
                            }
                        }
                    ]
                }
            }
        ];

        const result = await Employee.aggregate(pipeline);

        const totalRecords = result[0].metadata.length > 0 ? result[0].metadata[0].totalRecords : 0;
        const records = result[0].data;

        res.status(200).json({ 
            success: true, 
            data: records,
            pagination: {
                totalRecords,
                totalPages: Math.ceil(totalRecords / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Edit/Update
exports.updateAttendance = async (req, res) => {
    try {
        const updated = await DailyAttendance.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        ).populate('EmployeeID');
        
        res.status(200).json({ success: true, message: "Updated successfully", data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Delete
exports.deleteAttendance = async (req, res) => {
    try {
        await DailyAttendance.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Download Excel (सर्व कर्मचारी + ॲटेंडन्स)
exports.downloadExcel = async (req, res) => {
    try {
        const search = req.query.search || '';

        let pipeline = [
            ...(search ? [{
                $match: {
                    $or: [
                        { FirstName: { $regex: search, $options: 'i' } },
                        { LastName: { $regex: search, $options: 'i' } }
                    ]
                }
            }] : []),
            {
                $lookup: {
                    from: 'dailyattendances',
                    let: { empId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$EmployeeID', '$$empId'] } } },
                        { $sort: { Date: -1 } },
                        { $limit: 1 }
                    ],
                    as: 'attendanceData'
                }
            },
            { $unwind: { path: '$attendanceData', preserveNullAndEmptyArrays: true } },
            { $sort: { FirstName: 1 } }
        ];

        const records = await Employee.aggregate(pipeline);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Daily Attendance Report');

        worksheet.columns = [
            { header: 'Employee Name', key: 'empName', width: 30 },
            { header: 'Employee ID', key: 'empId', width: 20 },
            { header: 'Date', key: 'date', width: 15 },
            { header: 'In Time', key: 'inTime', width: 20 },
            { header: 'Out Time', key: 'outTime', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
        ];

        records.forEach(rec => {
            const emp = rec; // आता मूळ ऑब्जेक्ट कर्मचारी आहे
            const att = rec.attendanceData;

            const fName = emp.FirstName || emp.firstName || '';
            const lName = emp.LastName || emp.lastName || '';
            const empName = `${fName} ${lName}`.trim() || emp.name || 'N/A';
            const empId = emp.EmployeeID || 'N/A';

            worksheet.addRow({
                empName: empName,
                empId: empId,
                date: att && att.Date ? new Date(att.Date).toLocaleDateString('en-GB') : '-',
                inTime: att && att.CheckInTime ? new Date(att.CheckInTime).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}) : '-',
                outTime: att && att.CheckOutTime ? new Date(att.CheckOutTime).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}) : '-',
                status: att && att.Status ? att.Status : 'Not Marked'
            });
        });

        worksheet.getRow(1).font = { bold: true };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Daily_Attendance_Report.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// const DailyAttendance = require('../../models/HR/DailyAttendance');
// const ExcelJS = require('exceljs');

// // 1. Add Attendance (Check In करण्यासाठी)
// exports.addAttendance = async (req, res) => {
//     try {
//         const { EmployeeID, Date, CheckInTime, CheckOutTime, Status } = req.body;
        
//         // नवीन रेकॉर्ड तयार करा
//         const newRecord = new DailyAttendance({ 
//             EmployeeID, 
//             Date: Date || new Date(), 
//             CheckInTime, 
//             CheckOutTime, 
//             Status: Status || 'Present' 
//         });
        
//         await newRecord.save();
        
//         // सेव्ह केल्यानंतर Employee चा डेटा (नाव) सुद्धा पाठवा
//         const populatedRecord = await DailyAttendance.findById(newRecord._id).populate('EmployeeID');
        
//         res.status(201).json({ success: true, message: "Attendance marked successfully", data: populatedRecord });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // 2. View All Attendance (टेबलमध्ये दाखवण्यासाठी)
// exports.getAllAttendance = async (req, res) => {
//     try {
//         // सर्व ॲटेंडन्स डेटा घ्या आणि त्यात Employee ची माहिती घाला
//         const records = await DailyAttendance.find()
//             .populate('EmployeeID')
//             .sort({ Date: -1 });
            
//         res.status(200).json({ success: true, data: records });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // 3. Edit/Update (Check Out करण्यासाठी किंवा एडिट करण्यासाठी)
// exports.updateAttendance = async (req, res) => {
//     try {
//         const updated = await DailyAttendance.findByIdAndUpdate(
//             req.params.id, 
//             req.body, 
//             { new: true } // अपडेट झालेला नवीन डेटा परत मिळवा
//         ).populate('EmployeeID');
        
//         res.status(200).json({ success: true, message: "Updated successfully", data: updated });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // 4. Delete (रेकॉर्ड डिलीट करण्यासाठी)
// exports.deleteAttendance = async (req, res) => {
//     try {
//         await DailyAttendance.findByIdAndDelete(req.params.id);
//         res.status(200).json({ success: true, message: "Deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // 5. Download Excel File
// exports.downloadExcel = async (req, res) => {
//     try {
//         const records = await DailyAttendance.find().populate('EmployeeID');
//         const workbook = new ExcelJS.Workbook();
//         const worksheet = workbook.addWorksheet('Daily Attendance Report');

//         worksheet.columns = [
//             { header: 'Employee Name', key: 'empName', width: 30 },
//             { header: 'Employee ID', key: 'empId', width: 20 },
//             { header: 'Date', key: 'date', width: 15 },
//             { header: 'In Time', key: 'inTime', width: 20 },
//             { header: 'Out Time', key: 'outTime', width: 20 },
//             { header: 'Status', key: 'status', width: 15 },
//         ];

//         records.forEach(rec => {
//             let empName = 'N/A';
//             let empId = 'N/A';
            
//             if (rec.EmployeeID) {
//                 const emp = rec.EmployeeID;
//                 const fName = emp.FirstName || emp.firstName || '';
//                 const lName = emp.LastName || emp.lastName || '';
//                 empName = `${fName} ${lName}`.trim() || emp.name || 'N/A';
//                 empId = emp.EmployeeID || 'N/A';
//             }

//             worksheet.addRow({
//                 empName: empName,
//                 empId: empId,
//                 date: rec.Date ? new Date(rec.Date).toLocaleDateString('en-GB') : '-',
//                 inTime: rec.CheckInTime ? new Date(rec.CheckInTime).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}) : '-',
//                 outTime: rec.CheckOutTime ? new Date(rec.CheckOutTime).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}) : '-',
//                 status: rec.Status
//             });
//         });

//         worksheet.getRow(1).font = { bold: true };

//         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//         res.setHeader('Content-Disposition', 'attachment; filename=Daily_Attendance_Report.xlsx');
//         await workbook.xlsx.write(res);
//         res.end();
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };
// // const DailyAttendance = require('../../models/HR/DailyAttendance');
// // const ExcelJS = require('exceljs');

// // // 1. Add Attendance
// // exports.addAttendance = async (req, res) => {
// //     try {
// //         const { EmployeeID, Date, CheckInTime, CheckOutTime, Status } = req.body;
// //         const newRecord = new DailyAttendance({ EmployeeID, Date, CheckInTime, CheckOutTime, Status });
// //         await newRecord.save();
        
// //         // सेव्ह केल्यानंतर लगेच पॉप्युलेट करून रिस्पॉन्स पाठवा, जेणेकरून फ्रंटएंडवर नाव लगेच दिसेल
// //         const populatedRecord = await DailyAttendance.findById(newRecord._id).populate('EmployeeID');
        
// //         res.status(201).json({ success: true, message: "Attendance marked successfully", data: populatedRecord });
// //     } catch (error) {
// //         res.status(500).json({ success: false, message: error.message });
// //     }
// // };

// // // 2. View All Attendance
// // exports.getAllAttendance = async (req, res) => {
// //     try {
// //         // संपूर्ण Employee ऑब्जेक्ट पॉप्युलेट करा
// //         const records = await DailyAttendance.find().populate('EmployeeID').sort({ Date: -1 });
// //         res.status(200).json({ success: true, data: records });
// //     } catch (error) {
// //         res.status(500).json({ success: false, message: error.message });
// //     }
// // };

// // // 3. Edit/Update
// // exports.updateAttendance = async (req, res) => {
// //     try {
// //         // अपडेट केल्यानंतर पॉप्युलेट करून रिस्पॉन्स पाठवा
// //         const updated = await DailyAttendance.findByIdAndUpdate(
// //             req.params.id, 
// //             req.body, 
// //             { new: true }
// //         ).populate('EmployeeID');
        
// //         res.status(200).json({ success: true, message: "Updated successfully", data: updated });
// //     } catch (error) {
// //         res.status(500).json({ success: false, message: error.message });
// //     }
// // };

// // // 4. Delete
// // exports.deleteAttendance = async (req, res) => {
// //     try {
// //         await DailyAttendance.findByIdAndDelete(req.params.id);
// //         res.status(200).json({ success: true, message: "Deleted successfully" });
// //     } catch (error) {
// //         res.status(500).json({ success: false, message: error.message });
// //     }
// // };

// // // 5. Download Excel File
// // exports.downloadExcel = async (req, res) => {
// //     try {
// //         // Excel साठी देखील संपूर्ण Employee डेटा पॉप्युलेट करा
// //         const records = await DailyAttendance.find().populate('EmployeeID');
        
// //         const workbook = new ExcelJS.Workbook();
// //         const worksheet = workbook.addWorksheet('Daily Attendance Report');

// //         worksheet.columns = [
// //             { header: 'Employee Name', key: 'empName', width: 30 },
// //             { header: 'Employee ID', key: 'empId', width: 20 },
// //             { header: 'Date', key: 'date', width: 15 },
// //             { header: 'In Time', key: 'inTime', width: 20 },
// //             { header: 'Out Time', key: 'outTime', width: 20 },
// //             { header: 'Status', key: 'status', width: 15 },
// //         ];

// //         records.forEach(rec => {
// //             // नाव शोधण्याचे लॉजिक (FirstName, LastName किंवा name)
// //             let empName = 'N/A';
// //             let empId = 'N/A';
            
// //             if (rec.EmployeeID) {
// //                 const emp = rec.EmployeeID;
// //                 const fName = emp.FirstName || emp.firstName || '';
// //                 const lName = emp.LastName || emp.lastName || '';
// //                 const fullName = `${fName} ${lName}`.trim();
                
// //                 empName = fullName || emp.name || 'N/A';
// //                 empId = emp.EmployeeID || 'N/A';
// //             }

// //             worksheet.addRow({
// //                 empName: empName,
// //                 empId: empId,
// //                 date: rec.Date ? new Date(rec.Date).toLocaleDateString('en-GB') : '-',
// //                 inTime: rec.CheckInTime ? new Date(rec.CheckInTime).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}) : '-',
// //                 outTime: rec.CheckOutTime ? new Date(rec.CheckOutTime).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}) : '-',
// //                 status: rec.Status
// //             });
// //         });

// //         // Excel फाईलचे हेडिंग स्टाईल (ऐच्छिक)
// //         worksheet.getRow(1).font = { bold: true };

// //         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
// //         res.setHeader('Content-Disposition', 'attachment; filename=Daily_Attendance_Report.xlsx');
// //         await workbook.xlsx.write(res);
// //         res.end();
// //     } catch (error) {
// //         res.status(500).json({ success: false, message: error.message });
// //     }
// // };