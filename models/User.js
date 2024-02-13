const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: [true, "First name is required"] },
    lastName: { type: String, required: [true, "Last name is required"] },
    email: { type: String, required: [true, "Email address is required"] },
    password: { type: String, required: [true, "Password is required"] },
    isAdmin: { type: Boolean, default: false },
    mobileNo: { type: String, required: [true, "Mobile number is required"] },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    emailConfirmed: { type: Boolean, default: false },
    confirmationToken: String,
    confirmationExpires: Date
});

module.exports = mongoose.model("User", userSchema);