const Attendance = require("../models/Attendance");
const ScheduleActivity = require("../models/ScheduleActivity");
const User = require("../models/User");

// @desc    Get child attendance report
// @route   GET /api/reports/child-attendance
// @access  Private/Admin
const getChildAttendanceReport = async (req, res) => {
    try {
        const presentCount = await Attendance.countDocuments({ status: "Present" });
        const absentCount = await Attendance.countDocuments({ status: "Absent" });

        res.status(200).json({
            success: true,
            data: {
                present: presentCount,
                absent: absentCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get staff activity report
// @route   GET /api/reports/staff-activity
// @access  Private/Admin
const getStaffActivityReport = async (req, res) => {
    try {
        // Group by createdBy and count status "Completed"
        const report = await ScheduleActivity.aggregate([
            { $match: { status: "Completed" } },
            {
                $group: {
                    _id: "$createdBy",
                    completedCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "staffInfo"
                }
            },
            {
                $unwind: "$staffInfo"
            },
            {
                $project: {
                    _id: 1,
                    name: "$staffInfo.fullName",
                    completedCount: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getChildAttendanceReport,
    getStaffActivityReport
};
