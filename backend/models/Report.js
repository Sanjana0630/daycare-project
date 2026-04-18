const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
    childId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Child",
        required: true,
    },
    childName: {
        type: String,
    },
    className: {
        type: String,
    },
    range: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        required: true,
    },
    date: {
        type: String, // Store the period like "2026-04-01", "2026-W14", or "2026-04"
        required: true,
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    reportData: {
        type: mongoose.Schema.Types.Mixed, // Stores the full snapshot of activities/attendance
    },
}, { timestamps: true });

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
