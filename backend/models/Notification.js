const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    childId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Child",
        required: true,
    },
    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Report",
        required: true,
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["REPORT", "GENERAL"],
        default: "REPORT",
    },
    message: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
