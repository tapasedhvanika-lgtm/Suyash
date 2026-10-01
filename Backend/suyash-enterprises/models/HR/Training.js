// const mongoose = require("mongoose");

// const trainingSchema = new mongoose.Schema({
//     employeeId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Employee",
//         required: true,
//         index: true
//     },

//     trainingName: {
//         type: String,
//         required: true,
//         trim: true
//     },

//     description: {
//         type: String,
//         trim: true
//     },

//     trainingType: {
//         type: String,
//         enum: ["Internal", "External"],
//         default: "Internal"
//     },

//     provider: {
//         type: String,
//         trim: true
//     },

//     startDate: {
//         type: Date
//     },

//     endDate: {
//         type: Date
//     },

//     status: {
//         type: String,
//         enum: ["Pending", "Completed", "Failed"],
//         default: "Pending"
//     },

//     certificateNumber: {
//         type: String,
//         trim: true
//     },

//     issueDate: {
//         type: Date
//     },

//     expiryDate: {
//         type: Date,
//         index: true
//     },

//     certificateFile: {
//         type: String
//     },

//     certificateStatus: {
//         type: String,
//         enum: ["Valid", "Expired", "NotIssued"],
//         default: "NotIssued"
//     }

// }, {
//     timestamps: true
// });

// // Optional: Automatically update certificate status
// trainingSchema.pre("save", function(next) {

//     if (this.expiryDate) {

//         const today = new Date();

//         if (this.expiryDate < today) {
//             this.certificateStatus = "Expired";
//         } else {
//             this.certificateStatus = "Valid";
//         }

//     }

//     next();
// });

// module.exports = mongoose.model("Training", trainingSchema);

// const mongoose = require("mongoose");

// const trainingSchema = new mongoose.Schema({
//     employeeId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Employee",
//         required: false,
//         index: true
//     },

//     trainingName: {
//         type: String,
//         required: true,
//         trim: true
//     },

//     description: {
//         type: String,
//         trim: true
//     },

//     trainingType: {
//         type: String,
//         enum: ["Internal", "External"],
//         default: "Internal"
//     },

//     provider: {
//         type: String,
//         trim: true
//     },

//     startDate: {
//         type: Date
//     },

//     endDate: {
//         type: Date
//     },

//     status: {
//         type: String,
//         enum: [
//             "Scheduled",
//             "Assigned",
//             "InProgress",
//             "Completed",
//             "Failed"
//         ],
//         default: "Scheduled",
//         index: true
//     },

//     certificateNumber: {
//         type: String,
//         trim: true
//     },

//     issueDate: {
//         type: Date
//     },

//     expiryDate: {
//         type: Date,
//         index: true
//     },

//     certificateFile: {
//         type: String
//     },

//     certificateStatus: {
//         type: String,
//         enum: ["Valid", "Expired", "NotIssued"],
//         default: "NotIssued",
//         index: true
//     }

// }, {
//     timestamps: true
// });





// /*
// |--------------------------------------------------------------------------
// | AUTO UPDATE CERTIFICATE STATUS
// |--------------------------------------------------------------------------
// */

// trainingSchema.pre("save", function(next) {

//     if (!this.expiryDate) {
//         this.certificateStatus = "NotIssued";
//         return next();
//     }

//     const today = new Date();

//     if (this.expiryDate < today) {
//         this.certificateStatus = "Expired";
//     } else {
//         this.certificateStatus = "Valid";
//     }

//     next();
// });





// /*
// |--------------------------------------------------------------------------
// | VIRTUAL FIELD → CHECK IF CERTIFICATE EXPIRING SOON
// |--------------------------------------------------------------------------
// */

// trainingSchema.virtual("isExpiringSoon").get(function() {

//     if (!this.expiryDate) return false;

//     const today = new Date();
//     const diff = this.expiryDate - today;

//     const days = diff / (1000 * 60 * 60 * 24);

//     return days <= 30 && days > 0;
// });





// /*
// |--------------------------------------------------------------------------
// | SAFE OBJECT RETURN
// |--------------------------------------------------------------------------
// */

// trainingSchema.set("toJSON", { virtuals: true });
// trainingSchema.set("toObject", { virtuals: true });





// module.exports = mongoose.model("Training", trainingSchema);

// const mongoose = require("mongoose");

// const trainingSchema = new mongoose.Schema({

//     employeeId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Employee",
//         required: false,
//         index: true
//     },

//     trainingName: {
//         type: String,
//         required: true,
//         trim: true
//     },

//     description: {
//         type: String,
//         trim: true
//     },

//     trainingType: {
//         type: String,
//         enum: ["Internal", "External"],
//         default: "Internal"
//     },

//     provider: {
//         type: String,
//         trim: true
//     },

//     startDate: {
//         type: Date
//     },

//     endDate: {
//         type: Date
//     },

//     status: {
//         type: String,
//         enum: [
//             "Scheduled",
//             "Assigned",
//             "InProgress",
//             "Completed",
//             "Failed"
//         ],
//         default: "Scheduled",
//         index: true
//     },

//     certificateNumber: {
//         type: String,
//         trim: true
//     },

//     issueDate: {
//         type: Date
//     },

//     expiryDate: {
//         type: Date,
//         index: true
//     },

//     certificateFile: {
//         type: String
//     },

//     certificateStatus: {
//         type: String,
//         enum: ["Valid", "Expired", "NotIssued"],
//         default: "NotIssued",
//         index: true
//     }

// }, {
//     timestamps: true
// });


// /*
// |--------------------------------------------------------------------------
// | AUTO UPDATE CERTIFICATE STATUS
// |--------------------------------------------------------------------------
// */

// trainingSchema.pre("save", function(next) {

//     if (!this.expiryDate) {
//         this.certificateStatus = "NotIssued";
//         return next();
//     }

//     const today = new Date();

//     if (this.expiryDate < today) {
//         this.certificateStatus = "Expired";
//     } else {
//         this.certificateStatus = "Valid";
//     }

//     next();

// });


// /*
// |--------------------------------------------------------------------------
// | CHECK IF CERTIFICATE EXPIRING SOON
// |--------------------------------------------------------------------------
// */

// trainingSchema.virtual("isExpiringSoon").get(function() {

//     if (!this.expiryDate) return false;

//     const today = new Date();
//     const diff = this.expiryDate - today;

//     const days = diff / (1000 * 60 * 60 * 24);

//     return days <= 30 && days > 0;

// });


// trainingSchema.set("toJSON", { virtuals: true });
// trainingSchema.set("toObject", { virtuals: true });


// module.exports = mongoose.model("Training", trainingSchema);

const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema({
    trainingName: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        trim: true
    },

    trainingType: {
        type: String,
        enum: ["Internal", "External"],
        default: "Internal"
    },

    provider: {
        type: String,
        trim: true
    },

    startDate: {
        type: Date
    },

    endDate: {
        type: Date
    },

    status: {
        type: String,
        enum: [
            "Scheduled",
            "Assigned",
            "InProgress",
            "Completed",
            "Failed"
        ],
        default: "Scheduled",
        index: true
    },

    certificateNumber: {
        type: String,
        trim: true
    },

    issueDate: {
        type: Date
    },

    expiryDate: {
        type: Date,
        index: true
    },

    certificateFile: {
        type: String
    },

    certificateStatus: {
        type: String,
        enum: ["Valid", "Expired", "NotIssued"],
        default: "NotIssued",
        index: true
    }
}, {
    timestamps: true
});

/*
-----------------------------------------
AUTO UPDATE CERTIFICATE STATUS
-----------------------------------------
*/

trainingSchema.pre("save", function(next) {
    if (!this.expiryDate) {
        this.certificateStatus = "NotIssued";
        return next();
    }

    const today = new Date();

    this.certificateStatus =
        this.expiryDate < today ? "Expired" : "Valid";

    next();
});

/*
-----------------------------------------
CHECK IF CERTIFICATE EXPIRING SOON
-----------------------------------------
*/

trainingSchema.virtual("isExpiringSoon").get(function() {
    if (!this.expiryDate) return false;

    const today = new Date();
    const diff = this.expiryDate - today;

    const days = diff / (1000 * 60 * 60 * 24);

    return days <= 30 && days > 0;
});

trainingSchema.set("toJSON", { virtuals: true });
trainingSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Training", trainingSchema);