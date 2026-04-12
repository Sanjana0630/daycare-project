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
        const className = getClassFromAge(req.body.dob);
        const child = new Child({
            ...req.body,
            class: className, // User's snippet used className: className, but model uses 'class'
            photo: req.file ? `/uploads/${req.file.filename}` : ""
        });

        await child.save();
        res.status(201).json(child);
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
