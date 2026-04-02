const User = require("../models/User");
const Staff = require("../models/Staff");
const StaffAttendance = require("../models/StaffAttendance");
const Attendance = require("../models/Attendance");
const Child = require("../models/Child");
const ChildDailyActivity = require("../models/ChildDailyActivity");
const Feedback = require("../models/Feedback");

// Consistent date normalization helper (matches staffController)
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

// @desc    Get all users with role staff
// @route   GET /api/admin/staff
// @access  Private/Admin
const getStaffUsers = async (req, res) => {
    try {
        const staff = await Staff.find({}).lean();
        res.status(200).json({
            success: true,
            count: staff.length,
            data: staff,
        });
    } catch (error) {
        console.error('Error in getStaffUsers:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Upsert staff attendance
// @route   POST /api/admin/staff-attendance
// @access  Private/Admin
const upsertStaffAttendance = async (req, res) => {
    const { staff, staffId, date, status, remarks } = req.body;
    const finalStaffId = staffId || staff;

    if (!finalStaffId) {
        return res.status(400).json({ success: false, message: "Staff ID is required" });
    }

    try {
        // Use a start-of-day date to ensure consistency for querying
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const getTodayString = () => {
            const d = new Date();
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        };

        const dateStr = date.split('T')[0];
        const todayStr = getTodayString();

        if (dateStr !== todayStr) {
            return res.status(400).json({ success: false, message: "Staff attendance can only be marked for today." });
        }

        const attendance = await StaffAttendance.findOneAndUpdate(
            { staff: finalStaffId, date: attendanceDate },
            { status, remarks },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: attendance,
            message: "Staff attendance recorded successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get children attendance by date
// @route   GET /api/admin/children-attendance
// @access  Private/Admin
const getChildrenAttendance = async (req, res) => {
    const { date } = req.query;

    try {
        const queryDate = new Date(date || new Date());
        queryDate.setHours(0, 0, 0, 0);

        const rawAttendance = await Attendance.find({
            date: {
                $gte: queryDate,
                $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000)
            }
        })
            .populate("child", "childName photo parentName parentPhone")
            .populate("markedBy", "name")
            .lean();

        // Deduplicate: If multiple records exist for same child on this date, pick latest
        const attendanceMap = new Map();
        rawAttendance.forEach(record => {
            const childId = record.child?._id?.toString() || record.child?.toString();
            if (childId) {
                if (!attendanceMap.has(childId) || new Date(record.createdAt) > new Date(attendanceMap.get(childId).createdAt)) {
                    attendanceMap.set(childId, record);
                }
            }
        });

        const attendance = Array.from(attendanceMap.values());

        res.status(200).json({
            success: true,
            data: attendance,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get staff attendance by date
// @route   GET /api/admin/staff-attendance
// @access  Private/Admin
const getStaffAttendance = async (req, res) => {
    const { date } = req.query;

    try {
        const queryDate = new Date(date || new Date());
        queryDate.setHours(0, 0, 0, 0);

        const attendance = await StaffAttendance.find({
            date: queryDate
        });

        res.status(200).json({
            success: true,
            data: attendance,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get all pending staff members
// @route   GET /api/admin/staff/pending
// @access  Private/Admin
const getPendingStaff = async (req, res) => {
    try {
        const Staff = require("../models/Staff");
        const users = await User.find({ role: "staff", status: "pending" }).select("-password").lean();

        const emails = users.map(u => u.email.toLowerCase().trim());
        const profiles = await Staff.find({ email: { $in: emails.map(e => new RegExp('^' + e + '$', 'i')) } }).lean();

        const mergedData = users.map(user => {
            const userEmail = user.email.toLowerCase().trim();
            const profile = profiles.find(p => p.email.toLowerCase().trim() === userEmail) || {};
            return { ...profile, ...user, _id: user._id };
        });

        res.status(200).json({ success: true, count: mergedData.length, data: mergedData });
    } catch (error) {
        console.error('Error in getPendingStaff:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get all active staff members
// @route   GET /api/admin/staff/active
// @access  Private/Admin
const getActiveStaff = async (req, res) => {
    try {
        const users = await User.find({ role: "staff", status: "active" }).select("-password").lean();
        const emails = users.map(u => u.email.toLowerCase().trim());

        const profiles = await Staff.find({ email: { $in: emails.map(e => new RegExp('^' + e + '$', 'i')) } }).lean();

        const mergedData = users.map(user => {
            const userEmail = user.email.toLowerCase().trim();
            const profile = profiles.find(p => p.email.toLowerCase().trim() === userEmail);

            if (!profile) {
                return { ...user };
            }

            return { ...profile, ...user, _id: user._id };
        });

        res.status(200).json({
            success: true,
            count: mergedData.length,
            profilesMatched: profiles.length, // DIAGNOSTIC
            data: mergedData
        });
    } catch (error) {
        console.error('Error in getActiveStaff:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Approve staff member
// @route   PATCH /api/admin/staff/approve/:id
// @access  Private/Admin
const approveStaff = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }
        user.status = "active";
        await user.save();

        // No longer need local require as it is at top
        await Staff.findOneAndUpdate({ email: user.email }, { status: "Active" });

        res.status(200).json({ success: true, message: "Staff approved successfully", data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Reject staff member
// @route   PATCH /api/admin/staff/reject/:id
// @access  Private/Admin
const rejectStaff = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }
        user.status = "rejected";
        await user.save();

        // No longer need local require as it is at top
        await Staff.findOneAndUpdate({ email: user.email }, { status: "Rejected" });

        res.status(200).json({ success: true, message: "Staff rejected successfully", data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Delete staff member
// @route   DELETE /api/admin/staff/:id
// @access  Private/Admin
const deleteStaff = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "Staff user not found" });
        }

        // Delete associated Staff record if it exists
        const Staff = require("../models/Staff");
        await Staff.findOneAndDelete({ email: user.email });

        // Delete the User record
        await user.deleteOne();

        res.status(200).json({ success: true, message: "Staff deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get attendance history for a specific child
// @route   GET /api/admin/attendance-history/:childId
// @access  Private/Admin
const getChildAttendanceHistory = async (req, res) => {
    try {
        const child = await Child.findById(req.params.childId);
        if (!child) {
            return res.status(404).json({ success: false, message: "Child not found" });
        }

        // Fetch actual records marked by staff
        // Note: Filter out records where markedBy is null if they are considered "system" noise
        const actualHistory = await Attendance.find({ child: req.params.childId })
            .populate("markedBy", "name")
            .lean();

        // Create a map to group by normalized date string (YYYY-MM-DD)
        const historyMap = new Map();
        actualHistory.forEach(record => {
            if (record.date) {
                const dateKey = new Date(record.date).toISOString().split('T')[0];
                // Only keep records that were marked by a person (Requirement 6)
                if (record.markedBy) {
                    // If multiple records exist for same date, pick ONLY the LATEST record (Requirement 4)
                    if (!historyMap.has(dateKey) || new Date(record.createdAt) > new Date(historyMap.get(dateKey).createdAt)) {
                        historyMap.set(dateKey, record);
                    }
                }
            }
        });

        // Generate dates from admission to today
        const results = [];
        const startDate = getNormalizedDate(child.admissionDate);
        const today = getNormalizedDate();

        let currentDate = new Date(today);
        while (currentDate >= startDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const existingRecord = historyMap.get(dateStr);

            if (existingRecord) {
                results.push({
                    date: existingRecord.date,
                    status: existingRecord.status,
                    markedBy: existingRecord.markedBy,
                    markedAt: existingRecord.markedAt,
                    remarks: existingRecord.remarks || '-'
                });
            } else {
                // Return a virtual "Not Marked" record
                results.push({
                    date: new Date(currentDate),
                    status: "Not Marked",
                    markedBy: null,
                    markedAt: null,
                    remarks: "-"
                });
            }
            // Move to previous day
            currentDate.setDate(currentDate.getDate() - 1);
        }

        res.status(200).json({
            success: true,
            count: results.length,
            data: results,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get attendance history for a specific staff member
// @route   GET /api/admin/staff-attendance/history/:staffId
// @access  Private/Admin
const getStaffAttendanceHistory = async (req, res) => {
    try {
        const rawHistory = await StaffAttendance.find({ staff: req.params.staffId })
            .populate("staff", "name fullName email")
            .lean();

        // Group by date to remove duplicates and pick latest
        const historyMap = new Map();
        rawHistory.forEach(record => {
            if (record.date) {
                const dateKey = new Date(record.date).toISOString().split('T')[0];
                if (!historyMap.has(dateKey) || new Date(record.createdAt) > new Date(historyMap.get(dateKey).createdAt)) {
                    historyMap.set(dateKey, record);
                }
            }
        });

        const history = Array.from(historyMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({
            success: true,
            count: history.length,
            data: history,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get daily activity log for a child
// @route   GET /api/admin/child-activity/:childId
// @access  Private/Admin
const getChildDailyActivityLog = async (req, res) => {
    try {
        const { childId } = req.params;
        const { date } = req.query;
        const activityDate = getNormalizedDate(date);

        const dailyLog = await ChildDailyActivity.findOne({
            childId,
            date: activityDate
        }).populate("recordedBy", "name fullName");

        res.status(200).json({ success: true, data: dailyLog });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get monthly activity stats for a child
// @route   GET /api/admin/child-activity/monthly/:childId
// @access  Private/Admin
const getChildMonthlyActivityStats = async (req, res) => {
    try {
        const { childId } = req.params;
        const { month, year } = req.query;

        // Create range for the entire month using ISO date strings for clarity
        const startOfMonth = getNormalizedDate(`${year}-${month.toString().padStart(2, '0')}-01`);
        const nextMonth = month == 12 ? 1 : parseInt(month) + 1;
        const nextYear = month == 12 ? parseInt(year) + 1 : year;
        const endOfMonth = getNormalizedDate(`${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`);

        const logs = await ChildDailyActivity.find({
            childId,
            date: { $gte: startOfMonth, $lt: endOfMonth }
        }).populate("recordedBy", "name fullName");

        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get yearly activity stats for a child
// @route   GET /api/admin/child-activity/yearly/:childId
// @access  Private/Admin
const getChildYearlyActivityStats = async (req, res) => {
    try {
        const { childId } = req.params;
        const { year } = req.query;

        const startOfYear = getNormalizedDate(`${year}-01-01`);
        const nextYear = parseInt(year) + 1;
        const endOfYear = getNormalizedDate(`${nextYear}-01-01`);

        const logs = await ChildDailyActivity.find({
            childId,
            date: { $gte: startOfYear, $lt: endOfYear }
        }).populate("recordedBy", "name fullName");

        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get all users with role parent
// @route   GET /api/admin/parents
// @access  Private/Admin
const getParents = async (req, res) => {
    try {
        const parents = await User.find({ role: "parent" }).select("-password").lean();
        
        // Enhance with children count
        const parentIds = parents.map(p => p._id);
        const children = await Child.find({ parent: { $in: parentIds } }).lean();
        
        const enhancedParents = parents.map(parent => {
            const myChildren = children.filter(c => c.parent?.toString() === parent._id.toString());
            return {
                ...parent,
                childrenCount: myChildren.length,
                children: myChildren.map(c => ({ _id: c._id, childName: c.childName }))
            };
        });

        res.status(200).json({
            success: true,
            count: enhancedParents.length,
            data: enhancedParents,
        });
    } catch (error) {
        console.error('Error in getParents:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get feedback for a specific parent
// @route   GET /api/admin/parents/:id/feedback
// @access  Private/Admin
const getParentFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find({ parent: req.params.id })
            .populate("child", "childName")
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: feedback.length,
            data: feedback,
        });
    } catch (error) {
        console.error('Error in getParentFeedback:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Toggle feedback visibility
// @route   PATCH /api/admin/feedback/:id/toggle-visibility
// @access  Private/Admin
const toggleFeedbackVisibility = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) {
            return res.status(404).json({ success: false, message: "Feedback not found" });
        }

        feedback.isHidden = !feedback.isHidden;
        await feedback.save();

        res.status(200).json({
            success: true,
            message: `Feedback ${feedback.isHidden ? 'hidden' : 'shown'} successfully`,
            data: feedback,
        });
    } catch (error) {
        console.error('Error in toggleFeedbackVisibility:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Delete feedback entry
// @route   DELETE /api/admin/feedback/:id
// @access  Private/Admin
const deleteFeedbackEntry = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndDelete(req.params.id);
        if (!feedback) {
            return res.status(404).json({ success: false, message: "Feedback not found" });
        }

        res.status(200).json({
            success: true,
            message: "Feedback deleted successfully",
        });
    } catch (error) {
        console.error('Error in deleteFeedbackEntry:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    getStaffUsers,
    upsertStaffAttendance,
    getChildrenAttendance,
    getStaffAttendance,
    getPendingStaff,
    getActiveStaff,
    approveStaff,
    rejectStaff,
    deleteStaff,
    getChildAttendanceHistory,
    getStaffAttendanceHistory,
    getChildDailyActivityLog,
    getChildMonthlyActivityStats,
    getChildYearlyActivityStats,
    getParents,
    getParentFeedback,
    toggleFeedbackVisibility,
    deleteFeedbackEntry
};
