// const Training = require("../models/Training");


// // // Create Training Record
// // exports.createTraining = async(req, res) => {
// //     try {

// //         const training = new Training(req.body);
// //         const savedTraining = await training.save();

// //         res.status(201).json({
// //             success: true,
// //             message: "Training record created successfully",
// //             data: savedTraining
// //         });

// //     } catch (error) {

// //         res.status(500).json({
// //             success: false,
// //             message: error.message
// //         });

// //     }
// // };
// exports.createTraining = async(req, res) => {
//     try {

//         const data = {...req.body };

//         // Prevent ObjectId cast error
//         if (!data.employeeId || data.employeeId === "") {
//             delete data.employeeId;
//         }

//         const training = new Training(data);
//         const savedTraining = await training.save();

//         res.status(201).json({
//             success: true,
//             message: "Training record created successfully",
//             data: savedTraining
//         });

//     } catch (error) {

//         res.status(500).json({
//             success: false,
//             message: error.message
//         });

//     }
// };


// // Get All Training Records
// exports.getTrainings = async(req, res) => {
//     try {

//         const trainings = await Training.find()
//             .populate("employeeId");

//         res.status(200).json({
//             success: true,
//             count: trainings.length,
//             data: trainings
//         });

//     } catch (error) {

//         res.status(500).json({
//             success: false,
//             message: error.message
//         });

//     }
// };


// // Get Training By Employee
// exports.getEmployeeTraining = async(req, res) => {
//     try {

//         const trainings = await Training.find({
//             employeeId: req.params.employeeId
//         }).populate("employeeId");

//         res.status(200).json({
//             success: true,
//             count: trainings.length,
//             data: trainings
//         });

//     } catch (error) {

//         res.status(500).json({
//             success: false,
//             message: error.message
//         });

//     }
// };


// // Update Training Record
// exports.updateTraining = async(req, res) => {
//     try {

//         const training = await Training.findByIdAndUpdate(
//             req.params.id,
//             req.body, {
//                 new: true,
//                 runValidators: true
//             }
//         );

//         if (!training) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Training record not found"
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Training record updated successfully",
//             data: training
//         });

//     } catch (error) {

//         res.status(500).json({
//             success: false,
//             message: error.message
//         });

//     }
// };



// // Delete Training Record
// exports.deleteTraining = async(req, res) => {
//     try {

//         const training = await Training.findByIdAndDelete(req.params.id);

//         if (!training) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Training record not found"
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Training record deleted successfully"
//         });

//     } catch (error) {

//         res.status(500).json({
//             success: false,
//             message: error.message
//         });

//     }
// };

// const Training = require("../models/Training");
// const { generateCertificateNumber } = require("../utils/generateCertificate");



// /*
// |--------------------------------------------------------------------------
// | CREATE TRAINING
// |--------------------------------------------------------------------------
// */

// exports.createTraining = async(req, res) => {

//     try {

//         const data = {...req.body };

//         if (!data.employeeId || data.employeeId === "") {
//             delete data.employeeId;
//         }

//         const training = new Training(data);

//         const savedTraining = await training.save();

//         res.status(201).json({
//             success: true,
//             message: "Training record created successfully",
//             data: savedTraining
//         });

//     } catch (error) {

//         res.status(500).json({
//             success: false,
//             message: error.message
//         });

//     }

// };




// /*
// |--------------------------------------------------------------------------
// | GET ALL TRAININGS
// |--------------------------------------------------------------------------
// */

// exports.getTrainings = async(req, res) => {

//     try {

//         const trainings = await Training.find()
//             .populate("employeeId");

//         res.status(200).json({
//             success: true,
//             count: trainings.length,
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
// |--------------------------------------------------------------------------
// | GET EMPLOYEE TRAININGS
// |--------------------------------------------------------------------------
// */

// exports.getEmployeeTraining = async(req, res) => {

//     try {

//         const trainings = await Training.find({
//             employeeId: req.params.employeeId
//         }).populate("employeeId");

//         res.status(200).json({
//             success: true,
//             count: trainings.length,
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
// |--------------------------------------------------------------------------
// | UPDATE TRAINING
// |--------------------------------------------------------------------------
// */

// exports.updateTraining = async(req, res) => {

//     try {

//         const updateData = {...req.body };


//         /*
//         |--------------------------------------------------------------------------
//         | IF TRAINING COMPLETED → GENERATE CERTIFICATE
//         |--------------------------------------------------------------------------
//         */

//         if (updateData.status === "Completed") {

//             updateData.certificateNumber = generateCertificateNumber();

//             updateData.issueDate = new Date();

//             /* Default certificate validity = 1 year */

//             const expiry = new Date();
//             expiry.setFullYear(expiry.getFullYear() + 1);

//             updateData.expiryDate = expiry;

//             updateData.certificateStatus = "Valid";

//         }



//         const training = await Training.findByIdAndUpdate(
//             req.params.id,
//             updateData, {
//                 new: true,
//                 runValidators: true
//             }
//         );


//         if (!training) {

//             return res.status(404).json({
//                 success: false,
//                 message: "Training record not found"
//             });

//         }


//         res.status(200).json({
//             success: true,
//             message: "Training record updated successfully",
//             data: training
//         });

//     } catch (error) {

//         res.status(500).json({
//             success: false,
//             message: error.message
//         });

//     }

// };





// /*
// |--------------------------------------------------------------------------
// | DELETE TRAINING
// |--------------------------------------------------------------------------
// */

// exports.deleteTraining = async(req, res) => {

//     try {

//         const training = await Training.findByIdAndDelete(req.params.id);

//         if (!training) {

//             return res.status(404).json({
//                 success: false,
//                 message: "Training record not found"
//             });

//         }

//         res.status(200).json({
//             success: true,
//             message: "Training record deleted successfully"
//         });

//     } catch (error) {

//         res.status(500).json({
//             success: false,
//             message: error.message
//         });

//     }

// };

const Training = require("../../models/HR/Training");
const { generateCertificateNumber } = require("../../utils/generateCertificate");


/*
|--------------------------------------------------------------------------
| DATE FORMATTER → DD/MM/YYYY
|--------------------------------------------------------------------------
*/

const formatDate = (date) => {

    if (!date) return null;

    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
};


/*
|--------------------------------------------------------------------------
| FORMAT TRAINING OBJECT
|--------------------------------------------------------------------------
*/

const formatTraining = (training) => {

    const t = training.toObject();

    return {
        ...t,
        startDate: formatDate(t.startDate),
        endDate: formatDate(t.endDate),
        issueDate: formatDate(t.issueDate),
        expiryDate: formatDate(t.expiryDate)
    };

};



/*
|--------------------------------------------------------------------------
| CREATE TRAINING
|--------------------------------------------------------------------------
*/

exports.createTraining = async(req, res) => {

    try {

        const data = {...req.body };

        if (!data.employeeId || data.employeeId === "") {
            delete data.employeeId;
        }

        const training = new Training(data);

        const savedTraining = await training.save();

        res.status(201).json({
            success: true,
            message: "Training record created successfully",
            data: formatTraining(savedTraining)
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};




/*
|--------------------------------------------------------------------------
| GET ALL TRAININGS
|--------------------------------------------------------------------------
*/

exports.getTrainings = async(req, res) => {

    try {

        const trainings = await Training.find().sort({ createdAt: -1 }); // newest first

        const formatted = trainings.map(formatTraining);

        res.status(200).json({
            success: true,
            count: formatted.length,
            data: formatted
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};




/*
|--------------------------------------------------------------------------
| GET EMPLOYEE TRAININGS
|--------------------------------------------------------------------------
*/

exports.getEmployeeTraining = async(req, res) => {

    try {

        const trainings = await Training.find({
                employeeId: req.params.employeeId
            })
            .populate("employeeId")
            .sort({ createdAt: -1 });

        const formatted = trainings.map(formatTraining);

        res.status(200).json({
            success: true,
            count: formatted.length,
            data: formatted
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};




/*
|--------------------------------------------------------------------------
| UPDATE TRAINING
|--------------------------------------------------------------------------
*/

exports.updateTraining = async(req, res) => {

    try {

        const updateData = {...req.body };


        /*
        |--------------------------------------------------------------------------
        | IF TRAINING COMPLETED → GENERATE CERTIFICATE
        |--------------------------------------------------------------------------
        */

        if (updateData.status === "Completed") {

            updateData.certificateNumber = generateCertificateNumber();

            updateData.issueDate = new Date();

            const expiry = new Date();
            expiry.setFullYear(expiry.getFullYear() + 1);

            updateData.expiryDate = expiry;

            updateData.certificateStatus = "Valid";

        }



        const training = await Training.findByIdAndUpdate(
            req.params.id,
            updateData, {
                new: true,
                runValidators: true
            }
        );

        if (!training) {

            return res.status(404).json({
                success: false,
                message: "Training record not found"
            });

        }

        res.status(200).json({
            success: true,
            message: "Training record updated successfully",
            data: formatTraining(training)
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};




/*
|--------------------------------------------------------------------------
| DELETE TRAINING
|--------------------------------------------------------------------------
*/

exports.deleteTraining = async(req, res) => {

    try {

        const training = await Training.findByIdAndDelete(req.params.id);

        if (!training) {

            return res.status(404).json({
                success: false,
                message: "Training record not found"
            });

        }

        res.status(200).json({
            success: true,
            message: "Training record deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


/*
|--------------------------------------------------------------------------
| ✅ BULK DELETE TRAININGS (NEW)
|--------------------------------------------------------------------------
*/

exports.bulkDeleteTrainings = async(req, res) => {

    try {

        const { trainingIds } = req.body;

        if (!trainingIds || trainingIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No trainings selected for deletion"
            });
        }

        const result = await Training.deleteMany({ _id: { $in: trainingIds } });

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} training(s) deleted successfully`
        });

    } catch (error) {

        console.error("❌ Bulk delete training error:", error);

        res.status(500).json({
            success: false,
            message: "Server error: " + error.message
        });

    }

};