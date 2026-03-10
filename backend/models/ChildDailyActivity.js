const mongoose = require("mongoose");

const childDailyActivitySchema = new mongoose.Schema({
    childId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Child",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    activities: [{
        activityName: {
            type: String,
            required: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
        notes: {
            type: String,
            default: "",
        }
    }],
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
        required: true,
    }
}, { timestamps: true });

// Ensure unique combination of childId and date
childDailyActivitySchema.index({ childId: 1, date: 1 }, { unique: true });

const ChildDailyActivity = mongoose.model("ChildDailyActivity", childDailyActivitySchema);

module.exports = ChildDailyActivity;
