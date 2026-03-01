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

module.exports = router;
