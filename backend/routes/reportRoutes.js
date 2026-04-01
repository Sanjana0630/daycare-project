const express = require("express");
const router = express.Router();
const { protect, staff } = require("../middleware/authMiddleware");
const {
    getChildAttendanceReport,
    getStaffActivityReport,
    getAttendanceReport,
    generateDynamicReport
} = require("../controllers/reportController");

router.get("/generate", protect, staff, generateDynamicReport);
router.get("/child-attendance", protect, staff, getChildAttendanceReport);
router.get("/staff-activity", protect, staff, getStaffActivityReport);
router.get("/attendance", protect, staff, getAttendanceReport);

module.exports = router;
