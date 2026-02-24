const Child = require("../models/Child");
const Attendance = require("../models/Attendance");
const Activity = require("../models/Activity");
const Fee = require("../models/Fee");

// @desc    Get linked child for parent
// @route   GET /api/parent/child
// @access  Private/Parent
const getChildForParent = async (req, res) => {
    try {
        const child = await Child.findOne({ parent: req.user._id }).populate("assignedTeacher assignedCaretaker");

        if (!child) {
            return res.status(200).json({ success: true, data: null, message: "No child assigned yet. Please contact admin." });
        }

        res.status(200).json({ success: true, data: child });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get child attendance
// @route   GET /api/parent/attendance/child/:id
// @access  Private/Parent
const getChildAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ child: req.params.id }).sort({ date: -1 });
        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get child activities
// @route   GET /api/parent/activities/child/:id
// @access  Private/Parent
const getChildActivities = async (req, res) => {
    try {
        const activities = await Activity.find({ child: req.params.id }).sort({ timestamp: -1 });
        res.status(200).json({ success: true, data: activities });
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
