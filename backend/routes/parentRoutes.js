const express = require("express");
const router = express.Router();
const {
    getChildForParent,
    getChildAttendance,
    getChildActivities,
    getChildFees,
} = require("../controllers/parentController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.use(authorize("parent"));

router.get("/child", getChildForParent);
router.get("/attendance/child/:id", getChildAttendance);
router.get("/activities/child/:id", getChildActivities);
router.get("/fees/child/:id", getChildFees);

module.exports = router;
