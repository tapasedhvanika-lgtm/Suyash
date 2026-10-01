require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function resetPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected");

        const hash = await bcrypt.hash("Admin@123", 10);

        const result = await mongoose.connection.db
            .collection("users")
            .updateOne(
                { Email: "ceo@suyash.com" },
                {
                    $set: {
                        PasswordHash: hash,
                        Status: "active"
                    }
                }
            );

        console.log(
            "Password reset:",
            result.modifiedCount === 1
                ? "SUCCESS"
                : result.matchedCount === 1
                ? "USER FOUND, NO CHANGE"
                : "USER NOT FOUND"
        );

        await mongoose.disconnect();
    } catch (error) {
        console.error("ERROR:", error);
        process.exit(1);
    }
}

resetPassword();
