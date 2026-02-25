const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
    getStaffUsers,
    upsertStaffAttendance,
    getChildrenAttendance,
    getStaffAttendance,
} = require("../controllers/adminController");

router.get("/staff", protect, admin, getStaffUsers);
router.post("/staff-attendance", protect, admin, upsertStaffAttendance);
router.get("/staff-attendance", protect, admin, getStaffAttendance);
router.get("/children-attendance", protect, admin, getChildrenAttendance);

module.exports = router;
