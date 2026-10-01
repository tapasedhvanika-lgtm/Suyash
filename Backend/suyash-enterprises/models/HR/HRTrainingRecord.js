const mongoose = require("mongoose");

const hrTrainingRecordSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },

    training: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Training",
        required: true
    },

    trainingName: String,
    trainer: String,

    startDate: Date,
    endDate: Date,

    status: {
        type: String,
        enum: ["Assigned", "InProgress", "Completed", "Failed"],
        default: "Assigned"
    },

    score: Number,

    certificateNumber: String,
    certificateFile: String,

    expiryDate: Date,

    certificateStatus: {
        type: String,
        enum: ["Valid", "Expired", "NotIssued"],
        default: "NotIssued"
    },

    employeeName: String
}, { timestamps: true });

module.exports = mongoose.model("HRTrainingRecord", hrTrainingRecordSchema);