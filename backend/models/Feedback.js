const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    child: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Child",
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    category: {
        type: String,
        required: true,
        enum: ["Overall Experience", "Service", "Facility", "Staff", "Food", "Activities", "Teacher", "Facilities", "Other"],
    },
    message: {
        type: String,
        required: true,
    },
    isHidden: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
