const express = require("express");
const router = express.Router();
const {
    registerChild,
    getChildren,
    getChildById,
    updateChild,
    deleteChild,
} = require("../controllers/childController");

const upload = require("../middleware/uploadMiddleware");
const Child = require("../models/Child");

router.post("/add-child", upload.single("photo"), async (req, res) => {
    try {
        console.log("--- DEBUG: /add-child request received ---");
        console.log("req.file:", req.file);
        console.log("req.body:", req.body);

        const child = new Child({
            ...req.body,
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
    .get(getChildren);

router.route("/:id")
    .get(getChildById)
    .put(upload.single("photo"), updateChild)
    .delete(deleteChild);

module.exports = router;
