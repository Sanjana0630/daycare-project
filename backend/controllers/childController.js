const Child = require("../models/Child");

// @desc    Register a new child
// @route   POST /api/children
// @access  Public (or Private if auth middleware is added later)
const registerChild = async (req, res) => {
    try {
        const child = await Child.create(req.body);
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
        let child = await Child.findById(req.params.id);

        if (!child) {
            return res.status(404).json({ success: false, message: "Child not found" });
        }

        child = await Child.findByIdAndUpdate(req.params.id, req.body, {
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
