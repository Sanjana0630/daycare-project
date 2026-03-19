const Child = require("../models/Child");
const Attendance = require("../models/Attendance");
const Activity = require("../models/Activity");
const Fee = require("../models/Fee");

// @desc    Get linked child for parent
// @route   GET /api/parent/child
// @access  Private/Parent
const getChildForParent = async (req, res) => {
    try {
        // Try searching by parent ID first, then by email as fallback
        let child = await Child.findOne({ parent: req.user._id }).populate("assignedTeacher assignedCaretaker");

        if (!child) {
            child = await Child.findOne({ parentEmail: req.user.email }).populate("assignedTeacher assignedCaretaker");
        }

        if (!child) {
            return res.status(200).json({ success: true, data: null, message: "No child assigned yet. Please contact admin." });
        }

        res.status(200).json({ success: true, data: child });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get child attendance (Current month only)
// @route   GET /api/parent/attendance/child/:id
// @access  Private/Parent
const getChildAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({
            child: req.params.id
        }).sort({ date: -1 });

        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getChildActivities = async (req, res) => {
    try {
        const ChildDailyActivity = require("../models/ChildDailyActivity");

        // Use normalized date logic consistent with staffController
        const getNormalizedDate = (dateParam) => {
            const d = dateParam ? new Date(dateParam) : new Date();
            const dateStr = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(d);
            return new Date(`${dateStr}T00:00:00.000Z`);
        };

        const queryDate = getNormalizedDate();

        const dailyLog = await ChildDailyActivity.findOne({
            childId: req.params.id,
            date: queryDate
        }).populate("recordedBy", "name");

        // Format the data for the frontend
        if (!dailyLog) {
            return res.status(200).json({ success: true, data: [] });
        }

        const formattedActivities = dailyLog.activities.map(act => ({
            title: act.activityName,
            description: act.notes,
            completed: act.completed,
            rating: act.rating,
            staffName: dailyLog.recordedBy?.name || "Staff",
            timestamp: dailyLog.updatedAt // Use updatedAt as the time logged
        }));

        res.status(200).json({ success: true, data: formattedActivities });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get child fees
// @route   GET /api/parent/fees/child/:id
// @access  Private/Parent
const getChildFees = async (req, res) => {
    try {
        const fees = await Fee.find({ child: req.params.id }).sort({ dueDate: -1 });
        res.status(200).json({ success: true, data: fees });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    getChildForParent,
    getChildAttendance,
    getChildActivities,
    getChildFees,
};
