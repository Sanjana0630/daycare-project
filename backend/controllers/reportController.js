const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const ScheduleActivity = require("../models/ScheduleActivity");
const User = require("../models/User");
const Staff = require("../models/Staff");
const Child = require("../models/Child");
const StaffAttendance = require("../models/StaffAttendance");
const Report = require("../models/Report");
const ChildDailyActivity = require("../models/ChildDailyActivity");

// @desc    Get report by ID (Saved Report)
// @route   GET /api/reports/:id
// @access  Private
const getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const reportConfig = await Report.findById(id);

        if (!reportConfig) {
            return res.status(404).json({ success: false, message: "Report not found." });
        }

        // --- SECURITY CHECK ---
        if (req.user.role === 'parent') {
            const childData = await Child.findById(reportConfig.childId);
            if (!childData || childData.parent?.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: "You are not authorized to view this report." });
            }
        }

        // If snapshot data exists in the DB, return it immediately
        if (reportConfig.reportData) {
            return res.status(200).json({
                success: true,
                data: {
                    reportId: reportConfig._id,
                    ...reportConfig.reportData
                }
            });
        }

        // Backward compatibility: If no snapshot, generate live (for old reports)
        const reportData = await getUnifiedReportData(
            reportConfig.childId.toString(),
            reportConfig.range,
            reportConfig.date,
            req.user
        );

        res.status(200).json({
            success: true,
            data: {
                reportId: reportConfig._id,
                ...reportData
            }
        });
    } catch (error) {
        console.error("Error fetching saved report:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all reports (List)
// @route   GET /api/reports
// @access  Private
const getReports = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'staff') {
            query.generatedBy = req.user._id;
        } else if (req.user.role === 'parent') {
            const children = await Child.find({ parent: req.user._id }).select('_id');
            query.childId = { $in: children.map(c => c._id) };
        }

        const reports = await Report.find(query)
            .populate("childId", "childName class")
            .populate("generatedBy", "name fullName")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: reports
        });
    } catch (error) {
        console.error("Error fetching reports list:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Core Logic: Generates unified report data from multiple models
 * Reusable helper to avoid code duplication
 */
async function getUnifiedReportData(childId, range, date, user) {
    let startDate, endDate;

    // 1. Parse dates based on range
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
        if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        
        startDate = new Date(ISOweekStart);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
    } else if (range === 'monthly') {
        const [yearStr, monthStr] = date.split('-');
        startDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
        endDate = new Date(parseInt(yearStr), parseInt(monthStr), 0, 23, 59, 59, 999);
    }

    // 2. Build Base Queries
    let childQuery = { date: { $gte: startDate, $lte: endDate } };
    let childInfo = { name: "All Children", className: "All Classes", parentName: "N/A" };

    if (childId && childId !== 'all') {
        childQuery.child = childId;
        const childData = await Child.findById(childId).populate('parent', 'name');
        if (childData) {
            childInfo = {
                name: childData.childName,
                className: childData.class || "Unassigned",
                parentName: childData.parentName || childData.parent?.name || "Unknown",
                parentId: childData.parent?._id || null
            };
        }
    }

    // 3. Fetch Attendance
    let attendanceQuery = { ...childQuery };
    if (childId && childId !== 'all') {
        attendanceQuery.child = childId;
    } else if (user && user.role === 'staff') {
        // Find staff details to filter attendance for their assigned children
        const Staff = require('../models/Staff');
        const staffDoc = await Staff.findOne({ email: user.email });
        if (staffDoc) {
            const assignedChildren = await Child.find({
                $or: [
                    { class: staffDoc.assignedClass },
                    { assignedStaffId: staffDoc._id }
                ]
            }).select('_id');
            attendanceQuery.child = { $in: assignedChildren.map(c => c._id) };
        }
    }

    const attendanceRecords = await Attendance.find(attendanceQuery)
        .populate("child", "childName")
        .populate("markedBy", "name")
        .sort({ date: 1 });

    let summaryPresent = 0;
    let summaryAbsent = 0;

    const formattedAttendance = attendanceRecords.map(r => {
        const status = r.status || '-';
        if (status.toLowerCase() === 'present') summaryPresent++;
        else if (status.toLowerCase() === 'absent') summaryAbsent++;
        return {
            name: r.child?.childName || 'Unknown',
            date: r.date ? new Date(r.date).toISOString().split('T')[0] : 'Invalid Date',
            status: status,
            markedBy: r.markedBy?.name || 'System'
        };
    });

    // 4. Fetch Activities
    let activityQuery = { date: { $gte: startDate, $lte: endDate } };
    if (childId && childId !== 'all') {
        activityQuery.childId = childId;
    } else if (user && user.role === 'staff') {
        const Staff = require('../models/Staff');
        const staffDoc = await Staff.findOne({ email: user.email });
        if (staffDoc) {
            const assignedChildren = await Child.find({
                $or: [
                    { class: staffDoc.assignedClass },
                    { assignedStaffId: staffDoc._id }
                ]
            }).select('_id');
            activityQuery.childId = { $in: assignedChildren.map(c => c._id) };
        }
    }

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
                if (act.completed) totalCompleted++;
                if (act.completed && act.rating > 0) {
                    maxRatingSum += act.rating;
                    maxRatingCount++;
                }
                formattedActivities.push({
                    name: childName,
                    date: recordDateStr,
                    activity: act.activityName,
                    status: act.completed ? 'Completed' : 'Pending',
                    rating: act.rating || 0
                });
            });
        }
    });

    return {
        childInfo,
        attendance: formattedAttendance,
        activities: formattedActivities,
        summary: {
            presentDays: summaryPresent,
            absentDays: summaryAbsent,
            activitiesCompleted: totalCompleted,
            averageRating: maxRatingCount > 0 ? (maxRatingSum / maxRatingCount).toFixed(1) : 0
        }
    };
}

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

const generateFullReport = async (req, res) => {
    const { childId, range, date } = req.query;

    if (req.user.role === 'admin') {
        return res.status(403).json({ success: false, message: "Admin cannot generate reports. Admin can only view them." });
    }

    try {
        const reportData = await getUnifiedReportData(childId, range, date, req.user);

        // Save the full snapshot to the database
        let savedReportId = null;
        if (childId && childId !== 'all') {
            try {
                const staffId = req.user._id;
                if (mongoose.Types.ObjectId.isValid(childId) && mongoose.Types.ObjectId.isValid(staffId)) {
                    const newReport = await Report.create({
                        childId: new mongoose.Types.ObjectId(childId),
                        childName: reportData.childInfo.name,
                        className: reportData.childInfo.className,
                        range,
                        date,
                        generatedBy: new mongoose.Types.ObjectId(staffId),
                        reportData: reportData // Store the full snapshot logic
                    });
                    savedReportId = newReport._id;
                }
            } catch (saveErr) {
                console.error("Failed to snapshot report:", saveErr.message);
            }
        }

        res.status(200).json({
            success: true,
            data: {
                reportId: savedReportId,
                ...reportData
            }
        });
    } catch (error) {
        console.error('Report Generation Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getChildAttendanceReport,
    getStaffActivityReport,
    getAttendanceReport,
    generateDynamicReport,
    generateFullReport,
    getReportById,
    getReports
};
