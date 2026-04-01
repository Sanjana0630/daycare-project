const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
    childId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Child",
        required: true,
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
}, { timestamps: true });

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
