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
    markChildAttendance,
    addStaffActivity,
    getStaffDashboardSummary,
} = require("../controllers/staffController");

router.route("/")
    .post(registerStaff)
    .get(getStaffMembers);

router.get("/assigned-children", protect, getStaffChildren);
router.post("/mark-attendance", protect, markChildAttendance);
router.post("/add-activity", protect, addStaffActivity);
router.get("/dashboard-stats", protect, getStaffDashboardSummary);

router.route("/:id")
    .get(getStaffById)
    .put(updateStaff)
    .delete(deleteStaff);

module.exports = router;
