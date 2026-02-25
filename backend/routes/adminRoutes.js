const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
    getStaffUsers,
    upsertStaffAttendance,
    getChildrenAttendance,
    getStaffAttendance,
} = require("../controllers/adminController");

router.get("/staff", protect, authorize("admin"), getStaffUsers);
router.post("/staff-attendance", protect, authorize("admin"), upsertStaffAttendance);
router.get("/staff-attendance", protect, authorize("admin"), getStaffAttendance);
router.get("/children-attendance", protect, authorize("admin"), getChildrenAttendance);

module.exports = router;
