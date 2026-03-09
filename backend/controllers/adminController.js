const User = require("../models/User");
const Staff = require("../models/Staff");
const StaffAttendance = require("../models/StaffAttendance");
const Attendance = require("../models/Attendance");
const Child = require("../models/Child");

// @desc    Get all users with role staff
// @route   GET /api/admin/staff
// @access  Private/Admin
const getStaffUsers = async (req, res) => {
    try {
        const staff = await Staff.find({}).lean();
        console.log(`--- ADMIN: Fetched ${staff.length} staff profiles from Staff collection ---`);
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

        const attendance = await Attendance.find({
            date: {
                $gte: queryDate,
                $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000)
            }
        })
            .populate("child", "childName parentName parentPhone")
            .populate("markedBy", "name");

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
                console.log(`--- ADMIN: Merge failed for ${user.email} - no profile object found`);
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
};
