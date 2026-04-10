const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    childId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Child",
    },
    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Report",
    },
    feeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Fee",
    },
    feedbackId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Feedback",
    },
    contactId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ContactMessage",
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    type: {
        type: String,
        enum: ["REPORT", "GENERAL", "FEE", "FEEDBACK", "CONTACT"],
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
