const Child = require("../models/Child");
const Staff = require("../models/Staff");

function calculateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (today.getDate() < birthDate.getDate()) {
        months--;
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    return { years, months };
}

function getClassFromAge(dob) {
    const { years, months } = calculateAge(dob);

    if (years === 0 && months >= 1) return "Infant Care";
    if (years >= 1 && years < 2) return "Toddler Group";
    if (years >= 2 && years < 3) return "Play Group";
    if (years >= 3 && years < 4) return "Nursery";
    if (years >= 4 && years < 5) return "Junior KG";
    if (years >= 5 && years < 6) return "Senior KG";
    if (years >= 6 && years <= 10) return "After School Care";

    return "Not Eligible";
}

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

// @desc    Get all children
// @route   GET /api/children
// @access  Public
const getChildren = async (req, res) => {
    try {
        const children = await Child.find({});
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
            new: true,
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
