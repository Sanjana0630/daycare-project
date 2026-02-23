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
        const staff = await Staff.find({});
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

module.exports = {
    registerStaff,
    getStaffMembers,
    getStaffById,
    updateStaff,
    deleteStaff,
};
