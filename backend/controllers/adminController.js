const User = require("../models/User");
const StaffAttendance = require("../models/StaffAttendance");
const Attendance = require("../models/Attendance");
const Child = require("../models/Child");

// @desc    Get all users with role staff
// @route   GET /api/admin/staff
// @access  Private/Admin
const getStaffUsers = async (req, res) => {
    try {
        const staff = await User.find({ role: "staff" }).select("-password");
        res.status(200).json({
            success: true,
            count: staff.length,
            data: staff,
        });
    } catch (error) {
        console.error(error);
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
        }).populate("child", "childName parentName parentPhone");

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
        const staff = await User.find({ role: "staff", status: "pending" }).select("-password");
        res.status(200).json({ success: true, count: staff.length, data: staff });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get all active staff members
// @route   GET /api/admin/staff/active
// @access  Private/Admin
const getActiveStaff = async (req, res) => {
    try {
        const staff = await User.find({ role: "staff", status: "active" }).select("-password");
        res.status(200).json({ success: true, count: staff.length, data: staff });
    } catch (error) {
        console.error(error);
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

        // Also update Staff collection status
        const Staff = require("../models/Staff");
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

        // Also update Staff collection status
        const Staff = require("../models/Staff");
        await Staff.findOneAndUpdate({ email: user.email }, { status: "Rejected" });

        res.status(200).json({ success: true, message: "Staff rejected successfully", data: user });
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
};
