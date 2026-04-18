const express = require("express");
const router = express.Router();
const { protect, staff, admin } = require("../middleware/authMiddleware");
const {
    getChildAttendanceReport,
    getStaffActivityReport,
    getAttendanceReport,
    generateDynamicReport,
    generateFullReport,
    getReportById,
    getReports,
    deleteReport
} = require("../controllers/reportController");

router.get("/", protect, getReports);
router.get("/full", protect, generateFullReport);
router.get("/generate", protect, staff, generateDynamicReport);
router.get("/child-attendance", protect, staff, getChildAttendanceReport);
router.get("/staff-activity", protect, staff, getStaffActivityReport);
router.get("/attendance", protect, staff, getAttendanceReport);
router.get("/:id", protect, getReportById);
router.delete("/:id", protect, admin, deleteReport);

module.exports = router;
