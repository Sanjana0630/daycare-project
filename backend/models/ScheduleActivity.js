const mongoose = require("mongoose");

const scheduleActivitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["Completed", "Pending", "Missed"],
        default: "Pending",
    },
    description: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const ScheduleActivity = mongoose.model("ScheduleActivity", scheduleActivitySchema);

module.exports = ScheduleActivity;
