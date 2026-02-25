const mongoose = require("mongoose");

const staffAttendanceSchema = new mongoose.Schema({
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["present", "absent"],
        required: true,
    },
    remarks: {
        type: String,
        default: "",
    },
}, { timestamps: true });

// Ensure unique record per staff member per date
staffAttendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

const StaffAttendance = mongoose.model("StaffAttendance", staffAttendanceSchema);

module.exports = StaffAttendance;
