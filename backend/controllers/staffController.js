const Staff = require("../models/Staff");

// @desc    Register a new staff member
// @route   POST /api/staff
// @access  Public
const registerStaff = async (req, res) => {
    try {
        console.log('Received staff registration request:', req.body);
        const staff = await Staff.create(req.body);
        console.log('Staff member created successfully:', staff._id);
        res.status(201).json({
            success: true,
            data: staff,
            message: "Staff member registered successfully",
        });
    } catch (error) {
        console.error('Error creating staff member:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all staff members
// @route   GET /api/staff
// @access  Public
const getStaffMembers = async (req, res) => {
    try {
        const staff = await Staff.find({ status: "Active" });
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

// @desc    Get staff member by ID
// @route   GET /api/staff/:id
// @access  Public
const getStaffById = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff member not found" });
        }

        res.status(200).json({ success: true, data: staff });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Public
const updateStaff = async (req, res) => {
    try {
        let staff = await Staff.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff member not found" });
        }

        staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: staff });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Public
const deleteStaff = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff member not found" });
        }

        await staff.deleteOne();

        res.status(200).json({ success: true, data: {}, message: "Staff member removed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getStaffChildren = async (req, res) => {
    try {
        const staffMember = await Staff.findOne({ email: req.user.email });
        if (!staffMember) {
            return res.status(404).json({ success: false, message: "Staff record not found" });
        }

        const Child = require("../models/Child");
        const children = await Child.find({
            $or: [
                { assignedTeacher: staffMember._id },
                { assignedCaretaker: staffMember._id }
            ]
        });

        res.status(200).json({ success: true, count: children.length, data: children });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const markChildAttendance = async (req, res) => {
    try {
        const { childId, status, date, remarks, checkIn, checkOut } = req.body;
        const Attendance = require("../models/Attendance");

        const attendanceDate = new Date(date || new Date());
        attendanceDate.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOneAndUpdate(
            { child: childId, date: attendanceDate },
            { status, remarks, checkIn, checkOut },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addStaffActivity = async (req, res) => {
    try {
        const Activity = require("../models/Activity");
        const activity = await Activity.create(req.body);
        res.status(201).json({ success: true, data: activity });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getStaffDashboardSummary = async (req, res) => {
    try {
        const staff = await Staff.findOne({ email: req.user.email });
        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff record not found" });
        }

        const Child = require("../models/Child");
        const Attendance = require("../models/Attendance");
        const Activity = require("../models/Activity");

        const children = await Child.find({
            $or: [
                { assignedTeacher: staff._id },
                { assignedCaretaker: staff._id }
            ]
        });

        const childIds = children.map(c => c._id);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.find({
            child: { $in: childIds },
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        const presentToday = attendance.filter(a => a.status === 'Present').length;
        const absentToday = attendance.filter(a => a.status === 'Absent').length;

        const activitiesToday = await Activity.countDocuments({
            child: { $in: childIds },
            createdAt: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        res.status(200).json({
            success: true,
            data: {
                totalChildren: children.length,
                presentToday,
                absentToday,
                activitiesToday
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMyProfile = async (req, res) => {
    try {
        const staff = await Staff.findOne({ email: req.user.email });
        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff record not found" });
        }
        res.status(200).json({ success: true, data: staff });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateMyProfile = async (req, res) => {
    try {
        const staff = await Staff.findOneAndUpdate(
            { email: req.user.email },
            req.body,
            { new: true, runValidators: true, upsert: true }
        );
        res.status(200).json({ success: true, data: staff });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    registerStaff,
    getStaffMembers,
    getStaffById,
    updateStaff,
    deleteStaff,
    getStaffChildren,
    markChildAttendance,
    addStaffActivity,
    getStaffDashboardSummary,
    getMyProfile,
    updateMyProfile
};
