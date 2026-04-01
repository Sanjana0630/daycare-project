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

// @desc    Generate dynamic report
// @route   GET /api/reports/generate
// @access  Private/Admin
const generateDynamicReport = async (req, res) => {
    const { childId, type, range, date } = req.query;

    try {
        let startDate, endDate;

        if (range === 'daily') {
            const parsedDate = new Date(date);
            startDate = new Date(parsedDate);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(parsedDate);
            endDate.setHours(23, 59, 59, 999);
        } else if (range === 'weekly') {
            // date will be YYYY-Www, e.g. "2026-W14"
            const year = parseInt(date.substring(0, 4));
            const week = parseInt(date.substring(6));
            
            // Calculate start date of week
            const simple = new Date(year, 0, 1 + (week - 1) * 7);
            const dow = simple.getDay();
            const ISOweekStart = simple;
            if (dow <= 4)
                ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
            else
                ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
            
            startDate = new Date(ISOweekStart);
            startDate.setHours(0, 0, 0, 0);
            
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
        } else if (range === 'monthly') {
            // date will be YYYY-MM
            const [yearStr, monthStr] = date.split('-');
            const year = parseInt(yearStr);
            const month = parseInt(monthStr) - 1; // Month is 0-indexed
            
            startDate = new Date(year, month, 1);
            endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
        }

        let query = {};
        if (startDate && endDate) {
            query.date = { $gte: startDate, $lte: endDate };
        }
        
        if (childId && childId !== 'all') {
            if (type === 'attendance') {
                query.child = childId;
            } else if (type === 'activity') {
                query.childId = childId;
            }
        }

        let records = [];

        if (type === 'attendance') {
            records = await Attendance.find(query)
                .populate("child", "childName")
                .populate("markedBy", "name")
                .sort({ date: 1 });
            
            records = records.map(r => {
                const recordDate = r.date ? new Date(r.date) : null;
                const dateStr = recordDate && !isNaN(recordDate.getTime())
                    ? recordDate.toISOString().split('T')[0]
                    : 'Invalid Date';

                return {
                    name: r.child?.childName || 'Unknown',
                    date: dateStr,
                    status: r.status || '-',
                    markedBy: r.markedBy?.name || 'System'
                };
            });
        } else if (type === 'activity') {
            const ChildDailyActivity = require("../models/ChildDailyActivity");
            const activities = await ChildDailyActivity.find(query)
                .populate("childId", "childName")
                .populate("recordedBy", "name")
                .sort({ date: 1 });
            
            // Flatten the activities sub-document array
            activities.forEach(log => {
                const recordDateStr = new Date(log.date).toISOString().split('T')[0];
                const childName = log.childId?.childName || 'Unknown';
                
                if (log.activities && Array.isArray(log.activities)) {
                    log.activities.forEach(act => {
                        records.push({
                            name: childName,
                            date: recordDateStr,
                            activity: act.activityName,
                            status: act.completed ? 'Completed' : 'Pending',
                            rating: act.rating || 0
                        });
                    });
                }
            });
        }

        res.status(200).json({
            success: true,
            data: {
                records
            }
        });
    } catch (error) {
        console.error('Report Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Generate full unified report
// @route   GET /api/reports/full
// @access  Private/Admin
const generateFullReport = async (req, res) => {
    const { childId, range, date } = req.query;

    try {
        let startDate, endDate;

        if (range === 'daily') {
            const parsedDate = new Date(date);
            startDate = new Date(parsedDate);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(parsedDate);
            endDate.setHours(23, 59, 59, 999);
        } else if (range === 'weekly') {
            const year = parseInt(date.substring(0, 4));
            const week = parseInt(date.substring(6));
            
            const simple = new Date(year, 0, 1 + (week - 1) * 7);
            const dow = simple.getDay();
            const ISOweekStart = simple;
            if (dow <= 4)
                ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
            else
                ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
            
            startDate = new Date(ISOweekStart);
            startDate.setHours(0, 0, 0, 0);
            
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
        } else if (range === 'monthly') {
            const [yearStr, monthStr] = date.split('-');
            const year = parseInt(yearStr);
            const month = parseInt(monthStr) - 1;
            
            startDate = new Date(year, month, 1);
            endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
        }

        let childQuery = { date: { $gte: startDate, $lte: endDate } };
        
        let childInfo = {
            name: "All Children",
            className: "All Classes",
            parentName: "N/A"
        };

        if (childId && childId !== 'all') {
            childQuery.child = childId;
            
            const childData = await Child.findById(childId).populate('parent', 'name');
            if (childData) {
                childInfo = {
                    name: childData.childName,
                    className: childData.class || "Unassigned",
                    parentName: childData.parentName || childData.parent?.name || "Unknown"
                };
            }
        }

        // Fetch Attendance
        let attendanceQuery = { ...childQuery };
        if (childId && childId !== 'all') attendanceQuery.child = childId;

        const attendanceRecords = await Attendance.find(attendanceQuery)
            .populate("child", "childName")
            .populate("markedBy", "name")
            .sort({ date: 1 });
            
        let summaryPresent = 0;
        let summaryAbsent = 0;
            
        const formattedAttendance = attendanceRecords.map(r => {
            const status = r.status || '-';
            if (status.toLowerCase() === 'present') summaryPresent++;
            if (status.toLowerCase() === 'absent') summaryAbsent++;
            
            const recordDate = r.date ? new Date(r.date) : null;
            return {
                name: r.child?.childName || 'Unknown',
                date: recordDate && !isNaN(recordDate.getTime()) ? recordDate.toISOString().split('T')[0] : 'Invalid Date',
                status: status,
                markedBy: r.markedBy?.name || 'System'
            };
        });

        // Fetch Activities
        const ChildDailyActivity = require("../models/ChildDailyActivity");
        let activityQuery = { date: { $gte: startDate, $lte: endDate } };
        if (childId && childId !== 'all') activityQuery.childId = childId;

        const activityRecords = await ChildDailyActivity.find(activityQuery)
            .populate("childId", "childName")
            .populate("recordedBy", "name")
            .sort({ date: 1 });
            
        const formattedActivities = [];
        let totalCompleted = 0;
        let maxRatingSum = 0;
        let maxRatingCount = 0;
            
        activityRecords.forEach(log => {
            const recordDateStr = new Date(log.date).toISOString().split('T')[0];
            const childName = log.childId?.childName || 'Unknown';
            
            if (log.activities && Array.isArray(log.activities)) {
                log.activities.forEach(act => {
                    const isCompleted = act.completed;
                    const actRating = act.rating || 0;
                    
                    if (isCompleted) totalCompleted++;
                    if (isCompleted && actRating > 0) {
                        maxRatingSum += actRating;
                        maxRatingCount++;
                    }

                    formattedActivities.push({
                        name: childName,
                        date: recordDateStr,
                        activity: act.activityName,
                        status: isCompleted ? 'Completed' : 'Pending',
                        rating: actRating
                    });
                });
            }
        });

        const avgRating = maxRatingCount > 0 ? (maxRatingSum / maxRatingCount).toFixed(1) : 0;

        res.status(200).json({
            success: true,
            data: {
                childInfo,
                attendance: formattedAttendance,
                activities: formattedActivities,
                summary: {
                    presentDays: summaryPresent,
                    absentDays: summaryAbsent,
                    activitiesCompleted: totalCompleted,
                    averageRating: avgRating
                }
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
    getAttendanceReport,
    generateDynamicReport,
    generateFullReport
};
