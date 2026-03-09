const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
    getChildAttendanceReport,
    getStaffActivityReport,
    getAttendanceReport
} = require("../controllers/reportController");

router.get("/child-attendance", protect, admin, getChildAttendanceReport);
router.get("/staff-activity", protect, admin, getStaffActivityReport);
router.get("/attendance", protect, admin, getAttendanceReport);

module.exports = router;
