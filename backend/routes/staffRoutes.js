const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
    registerStaff,
    getStaffMembers,
    getStaffById,
    updateStaff,
    deleteStaff,
    getStaffChildren,
    getChildrenAttendance,
    getAttendanceHistory,
    markChildAttendance,
    addStaffActivity,
    getStaffDashboardSummary,
    getMyProfile,
    updateMyProfile,
    getScheduleActivities,
    markScheduleActivityCompleted,
    addCustomScheduleActivity,
    deleteScheduleActivity
} = require("../controllers/staffController");

router.route("/")
    .post(registerStaff)
    .get(getStaffMembers);

router.get("/assigned-children", protect, getStaffChildren);
router.get("/children-attendance", protect, getChildrenAttendance);
router.get("/attendance-history", protect, getAttendanceHistory);
router.post("/mark-attendance", protect, markChildAttendance);
router.post("/add-activity", protect, addStaffActivity);
router.get("/dashboard-stats", protect, getStaffDashboardSummary);
router.get("/schedule", protect, getScheduleActivities);
router.post("/schedule/mark", protect, markScheduleActivityCompleted);
router.post("/schedule/custom", protect, addCustomScheduleActivity);
router.delete("/schedule/:id", protect, deleteScheduleActivity);
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);

router.route("/:id")
    .get(getStaffById)
    .put(updateStaff)
    .delete(deleteStaff);

module.exports = router;
