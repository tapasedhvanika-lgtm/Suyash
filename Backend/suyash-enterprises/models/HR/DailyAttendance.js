const mongoose = require('mongoose');

const dailyAttendanceSchema = new mongoose.Schema({
    EmployeeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee', // ⚠️ तुमच्या Employee मॉडेलचे नाव 'Employee' असेच आहे ना ते तपासा
        required: true
    },
    Date: {
        type: Date,
        required: true,
        default: Date.now
    },
    CheckInTime: {
        type: Date,
        default: null // सुरुवातीला null ठेवा, नंतर भरता येईल
    },
    CheckOutTime: {
        type: Date,
        default: null // सुरुवातीला null ठेवा
    },
    Status: {
        type: String,
        enum: ['Present', 'Absent', 'Late', 'Half-Day', 'Work-From-Home'],
        default: 'Present'
    }
}, { timestamps: true });

module.exports = mongoose.model('DailyAttendance', dailyAttendanceSchema);