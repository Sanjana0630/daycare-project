const Child = require("../models/Child");
const User = require("../models/User");

// @desc    Add a new child
// @route   POST /api/children
// @access  Private/Admin
const addChild = async (req, res) => {
    try {
        const child = await Child.create(req.body);
        res.status(201).json({
            success: true,
            data: child,
            message: "Child added successfully",
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to add child",
        });
    }
};

// @desc    Get all staff (caretakers)
// @route   GET /api/children/staff
// @access  Private/Admin
const getStaff = async (req, res) => {
    try {
        const staff = await User.find({ role: "staff" }).select("fullName _email");
        res.status(200).json({
            success: true,
            data: staff,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch staff members",
        });
    }
};

module.exports = {
    addChild,
    getStaff,
};
