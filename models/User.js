const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: String, default: false },
    mobileNo: { type: String, required: true }
});

module.exports = mongoose.model("User", UserSchema);