const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
    getStaffUsers,
    upsertStaffAttendance,
    getChildrenAttendance,
    getStaffAttendance,
    getPendingStaff,
    getActiveStaff,
    approveStaff,
    rejectStaff,
    deleteStaff,
    getChildAttendanceHistory,
    getStaffAttendanceHistory,
    getChildDailyActivityLog,
    getChildMonthlyActivityStats,
    getChildYearlyActivityStats,
    getParents,
    getParentFeedback,
    toggleFeedbackVisibility,
    deleteFeedbackEntry
} = require("../controllers/adminController");

router.get("/staff", protect, admin, getStaffUsers);
router.get("/staff/pending", protect, admin, getPendingStaff);
router.get("/staff/active", protect, admin, getActiveStaff);
router.patch("/staff/approve/:id", protect, admin, approveStaff);
router.patch("/staff/reject/:id", protect, admin, rejectStaff);
router.delete("/staff/:id", protect, admin, deleteStaff);
router.post("/staff-attendance", protect, admin, upsertStaffAttendance);
router.get("/staff-attendance", protect, admin, getStaffAttendance);
router.get("/children-attendance", protect, admin, getChildrenAttendance);
router.get("/attendance-history/:childId", protect, admin, getChildAttendanceHistory);
router.get("/staff-attendance/history/:staffId", protect, admin, getStaffAttendanceHistory);
router.get("/child-activity/:childId", protect, admin, getChildDailyActivityLog);
router.get("/child-activity/monthly/:childId", protect, admin, getChildMonthlyActivityStats);
router.get("/child-activity/yearly/:childId", protect, admin, getChildYearlyActivityStats);

// Parent Management & Feedback
router.get("/parents", protect, admin, getParents);
router.get("/parents/:id/feedback", protect, admin, getParentFeedback);
router.patch("/feedback/:id/toggle-visibility", protect, admin, toggleFeedbackVisibility);
router.delete("/feedback/:id", protect, admin, deleteFeedbackEntry);

module.exports = router;
