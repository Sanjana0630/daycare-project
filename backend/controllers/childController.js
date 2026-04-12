const Child = require("../models/Child");
const Staff = require("../models/Staff");
const getClassFromAge = require("../utils/getClassFromAge");

// @desc    Register a new child
// @route   POST /api/children
// @access  Public (or Private if auth middleware is added later)
const registerChild = async (req, res) => {
    try {
        const data = { ...req.body };
        // Sanitize optional relationship fields
        if (data.assignedTeacher === "") data.assignedTeacher = null;
        if (data.assignedCaretaker === "") data.assignedCaretaker = null;
        if (data.parent === "") data.parent = null;

        // Age Validation & Class Auto-Assignment
        const assignedClass = getClassFromAge(data.dob);
        if (assignedClass === "Not Eligible") {
            return res.status(400).json({ success: false, message: "Daycare supports children from 1 month to 10 years" });
        }
        data.class = assignedClass;

        // Auto-assign teacher based on class
        const teacher = await Staff.findOne({ role: "Teacher", assignedClass });
        data.assignedTeacher = teacher ? teacher._id : null;

        // Add photo path if file is uploaded
        if (req.file) {
            data.photo = `/uploads/${req.file.filename}`;
        }

        const child = await Child.create(data);
        res.status(201).json({
            success: true,
            data: child,
            message: "Child registered successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all children or assigned children if staff
// @route   GET /api/children
// @access  Private
const getChildren = async (req, res) => {
    try {
        let query = {};

        // Detect logged-in user role
        if (req.user && req.user.role === "staff") {
            const staff = await Staff.findOne({ email: req.user.email });
            if (staff) {
                query = {
                    $or: [
                        { assignedStaffId: staff._id },
                        { class: staff.assignedClass }
                    ]
                };
            } else {
                query = { _id: null }; // No staff found, return empty
            }
        }

        const children = await Child.find(query);

        // Debug Check - wrapped in development mode check
        if (process.env.NODE_ENV === "development" && req.user && req.user.role === "staff") {
            const staff = await Staff.findOne({ email: req.user.email });
            if (staff && staff.assignedClass) {
                // Debug logs suppressed by default to prevent spam
                // console.log("Staff:", staff._id);
                // console.log("Assigned Class:", staff.assignedClass);
                // console.log("Filtered Children Count:", children.length);
            }
        }

        res.status(200).json({
            success: true,
            count: children.length,
            data: children,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get child by ID
// @route   GET /api/children/:id
// @access  Public
const getChildById = async (req, res) => {
    try {
        const child = await Child.findById(req.params.id);

        if (!child) {
            return res.status(404).json({ success: false, message: "Child not found" });
        }

        res.status(200).json({ success: true, data: child });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Update child
// @route   PUT /api/children/:id
// @access  Public
const updateChild = async (req, res) => {
    try {
        const data = { ...req.body };
        // Sanitize optional relationship fields
        if (data.assignedTeacher === "") data.assignedTeacher = null;
        if (data.assignedCaretaker === "") data.assignedCaretaker = null;
        if (data.parent === "") data.parent = null;

        let child = await Child.findById(req.params.id);

        if (!child) {
            return res.status(404).json({ success: false, message: "Child not found" });
        }

        // Age Validation & Class Auto-Assignment
        let targetClass = child.class;
        if (data.dob) {
            const assignedClass = getClassFromAge(data.dob);
            if (assignedClass === "Not Eligible") {
                return res.status(400).json({ success: false, message: "Daycare supports children from 1 month to 10 years" });
            }
            data.class = assignedClass;
            targetClass = assignedClass;
        }

        // Auto-assign teacher based on class whenever updating
        if (targetClass) {
            const teacher = await Staff.findOne({ role: "Teacher", assignedClass: targetClass });
            data.assignedTeacher = teacher ? teacher._id : null;
        }

        // Add photo path if file is uploaded
        if (req.file) {
            data.photo = `/uploads/${req.file.filename}`;
        }

        child = await Child.findByIdAndUpdate(req.params.id, data, {
            returnDocument: 'after',
            runValidators: true,
        });

        res.status(200).json({ success: true, data: child });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Delete child
// @route   DELETE /api/children/:id
// @access  Public
const deleteChild = async (req, res) => {
    try {
        const child = await Child.findById(req.params.id);

        if (!child) {
            return res.status(404).json({ success: false, message: "Child not found" });
        }

        await child.deleteOne();

        res.status(200).json({ success: true, data: {}, message: "Child removed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    registerChild,
    getChildren,
    getChildById,
    updateChild,
    deleteChild,
};
