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
    photo: {
        type: String,
        default: "",
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
    monthlyFee: {
        type: Number,
        default: 0,
    },
    lastPaymentDate: {
        type: Date,
        default: null,
    },
    class: {
        type: String,
        required: true,
        default: "Unassigned", // To avoid breaking existing records
    },
    assignedTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
        default: null, // Optional
    },
    assignedCaretaker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
        default: null, // Optional
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null, // Optional
    },
}, { timestamps: true });

const Child = mongoose.model("Child", childSchema);

module.exports = Child;
