const Attendance = require("../models/Attendance");
const ScheduleActivity = require("../models/ScheduleActivity");
const User = require("../models/User");
const Staff = require("../models/Staff");
const Child = require("../models/Child");
const StaffAttendance = require("../models/StaffAttendance");

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

// @desc    Get attendance report based on filters
// @route   GET /api/reports/attendance
// @access  Private/Admin
const getAttendanceReport = async (req, res) => {
    const { type, range, date, month, year } = req.query;

    try {
        let startDate, endDate;
        const targetYear = parseInt(year);
        const targetMonth = parseInt(month);

        if (range === 'daily') {
            startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
        } else if (range === 'monthly') {
            startDate = new Date(targetYear, targetMonth, 1);
            endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
        } else if (range === 'yearly') {
            startDate = new Date(targetYear, 0, 1);
            endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);
        }

        let records;
        if (type === 'child') {
            records = await Attendance.find({
                date: { $gte: startDate, $lte: endDate }
            })
                .populate("child", "childName")
                .populate("markedBy", "name")
                .sort({ date: 1 });
        } else {
            records = await StaffAttendance.find({
                date: { $gte: startDate, $lte: endDate }
            })
                .populate("staff", "name fullName email")
                .sort({ date: 1 });
        }

        // Calculate summary for graph
        const summary = records.reduce((acc, curr) => {
            const status = (curr.status || '').toLowerCase();
            if (status === 'present') acc.present++;
            else if (status === 'absent') acc.absent++;
            return acc;
        }, { present: 0, absent: 0 });

        res.status(200).json({
            success: true,
            data: {
                summary,
                records: records.map(r => {
                    const recordDate = r.date ? new Date(r.date) : null;
                    const dateStr = recordDate && !isNaN(recordDate.getTime())
                        ? recordDate.toISOString().split('T')[0]
                        : 'Invalid Date';

                    return {
                        name: type === 'child' ? r.child?.childName : (r.staff?.fullName || r.staff?.name || 'Unknown'),
                        date: dateStr,
                        status: r.status || '-',
                        markedBy: type === 'child' ? (r.markedBy?.name || 'System') : 'Admin',
                        time: r.markedAt ? new Date(r.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'),
                        remarks: r.remarks || '-'
                    };
                })
            }
        });
    } catch (error) {
        console.error('Report Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getChildAttendanceReport,
    getStaffActivityReport,
    getAttendanceReport
};
