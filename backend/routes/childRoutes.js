const express = require("express");
const router = express.Router();
const {
    registerChild,
    getChildren,
    getChildById,
    updateChild,
    deleteChild,
} = require("../controllers/childController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const Child = require("../models/Child");

const getClassFromAge = require("../utils/getClassFromAge");

router.post("/add-child", upload.single("photo"), async (req, res) => {
    try {
        const { 
            childName, dob, gender, bloodGroup, 
            parentName, parentEmail, parentPhone, 
            emergencyContactName, emergencyContactNumber 
        } = req.body;

        // Validation logic
        if (!childName || !/^[A-Za-z\s]{2,}$/.test(childName)) {
            return res.status(400).json({ success: false, message: "Enter valid child name" });
        }
        if (!dob || new Date(dob) > new Date()) {
            return res.status(400).json({ success: false, message: "Select valid date of birth" });
        }
        if (!gender) {
            return res.status(400).json({ success: false, message: "Please select gender" });
        }
        if (!bloodGroup) {
            return res.status(400).json({ success: false, message: "Please select blood group" });
        }
        if (!parentName || !/^[A-Za-z\s]+$/.test(parentName)) {
            return res.status(400).json({ success: false, message: "Enter valid parent name" });
        }
        if (!parentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
            return res.status(400).json({ success: false, message: "Enter valid email address" });
        }
        if (!parentPhone || !/^\d{10}$/.test(parentPhone)) {
            return res.status(400).json({ success: false, message: "Enter valid 10-digit mobile number" });
        }
        if (!emergencyContactNumber || !/^\d{10}$/.test(emergencyContactNumber)) {
            return res.status(400).json({ success: false, message: "Enter valid 10-digit mobile number" });
        }

        const className = getClassFromAge(req.body.dob);
        if (className === "Not Eligible") {
            return res.status(400).json({ success: false, message: "Care Connect supports children from 1 month to 10 years" });
        }

        const child = new Child({
            ...req.body,
            class: className,
            photo: req.file ? `/uploads/${req.file.filename}` : ""
        });

        await child.save();
        res.status(201).json({ success: true, data: child });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
});

router.route("/")
    .post(upload.single("photo"), registerChild)
    .get(protect, getChildren);

router.route("/:id")
    .get(getChildById)
    .put(upload.single("photo"), updateChild)
    .delete(deleteChild);

module.exports = router;
