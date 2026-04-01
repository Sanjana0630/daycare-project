const express = require("express");
const router = express.Router();
const { protect, staff } = require("../middleware/authMiddleware");
const {
    getChildAttendanceReport,
    getStaffActivityReport,
    getAttendanceReport,
    generateDynamicReport,
    generateFullReport,
    getReportById
} = require("../controllers/reportController");

router.get("/full", protect, staff, generateFullReport);
router.get("/generate", protect, staff, generateDynamicReport);
router.get("/child-attendance", protect, staff, getChildAttendanceReport);
router.get("/staff-activity", protect, staff, getStaffActivityReport);
router.get("/attendance", protect, staff, getAttendanceReport);
router.get("/:id", protect, getReportById);

module.exports = router;
