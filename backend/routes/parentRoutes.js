const express = require("express");
const router = express.Router();
const {
    getChildForParent,
    getChildAttendance,
    getChildActivities,
    getChildFees,
    getParentActivitiesDirect,
} = require("../controllers/parentController");
const { protect, parent } = require("../middleware/authMiddleware");

router.use(protect);
router.use(parent);

router.get("/child", getChildForParent);
router.get("/attendance/child/:id", getChildAttendance);
router.get("/activities/child/:id", getChildActivities);
router.get("/fees/child/:id", getChildFees);
router.get("/activities/parent", getParentActivitiesDirect);

module.exports = router;
