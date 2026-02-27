const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["Teacher", "Caretaker", "Admin", "Principal"],
    },
    dob: {
        type: Date,
        required: true,
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true,
    },
    joiningDate: {
        type: Date,
        default: Date.now,
    },
    qualification: {
        type: String,
        required: true,
    },
    experience: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Pending", "Rejected"],
        default: "Pending",
    },
}, { timestamps: true });

const Staff = mongoose.model("Staff", staffSchema);

module.exports = Staff;
