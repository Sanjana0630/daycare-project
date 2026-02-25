const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    child: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Child",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    meals: {
        type: String,
    },
    napTime: {
        type: String,
    },
    healthNotes: {
        type: String,
    },
    behaviorNotes: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
