const mongoose = require("mongoose");

const childSchema = new mongoose.Schema({
    childName: {
        type: String,
        required: true,
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
    bloodGroup: {
        type: String,
        required: true,
    },
    admissionDate: {
        type: Date,
        required: true,
    },
    parentName: {
        type: String,
        required: true,
    },
    parentEmail: {
        type: String,
        required: true,
    },
    parentPhone: {
        type: String,
        required: true,
    },
    emergencyContactName: {
        type: String,
        required: true,
    },
    emergencyContactNumber: {
        type: String,
        required: true,
    },
    allergies: {
        type: String,
    },
    medicalConditions: {
        type: String,
    },
    caretaker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });

const Child = mongoose.model("Child", childSchema);

module.exports = Child;
