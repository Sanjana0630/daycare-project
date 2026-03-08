const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    child: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Child",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["Pending", "Present", "Absent"],
        default: "Pending",
        required: true,
    },
    checkIn: {
        type: String,
    },
    checkOut: {
        type: String,
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
    },
    markedAt: {
        type: Date,
    },
    remarks: {
        type: String,
    },
}, { timestamps: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
